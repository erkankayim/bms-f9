"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import * as z from "zod"
import { addMonths, formatISO, isBefore, startOfDay } from "date-fns"
import { checkAndManageLowStockAlert } from "@/lib/inventory-utils"

// Satış kalemi şeması
const saleItemSchema = z.object({
  product_stock_code: z.string().min(1, "Ürün seçimi gereklidir"),
  product_name: z.string().optional(),
  quantity: z.coerce.number().int().positive("Miktar pozitif bir sayı olmalıdır"),
  unit_price: z.coerce.number().positive("Birim fiyat pozitif bir sayı olmalıdır"),
  vat_rate: z.coerce.number().min(0, "KDV oranı negatif olamaz"),
  item_total_gross: z.coerce.number().nonnegative("Toplam tutar negatif olamaz"),
  item_total_net: z.coerce.number().nonnegative("KDV dahil toplam tutar negatif olamaz"),
})

// Satış formu şeması
const saleActionSchema = z
  .object({
    customer_mid: z.string().optional().nullable(),
    items: z.array(saleItemSchema).min(1, "En az bir ürün eklemelisiniz"),
    payment_method: z.string().min(1, "Ödeme yöntemi seçimi gereklidir"),
    sale_currency: z.string().length(3, "Para birimi 3 karakter olmalıdır.").default("TRY"),
    is_installment: z.boolean().default(false),
    installment_count: z.coerce.number().int().positive().optional().nullable(),
    discount_amount: z.coerce.number().nonnegative("İndirim tutarı negatif olamaz").default(0),
    notes: z.string().optional(),
    total_amount: z.coerce.number().nonnegative("Toplam tutar negatif olamaz"),
    tax_amount: z.coerce.number().nonnegative("Vergi tutarı negatif olamaz"),
    final_amount: z.coerce.number().nonnegative("Genel toplam negatif olamaz"),
  })
  .refine(
    (data) => {
      if (data.is_installment && (!data.installment_count || data.installment_count <= 0)) {
        return false
      }
      if (data.is_installment && data.payment_method === "cash") {
        return false
      }
      return true
    },
    {
      message: "Taksitli ödeme seçiliyse, geçerli bir taksit sayısı girilmeli ve ödeme yöntemi nakit olmamalıdır.",
      path: ["installment_count"],
    },
  )

type SaleActionPayload = z.infer<typeof saleActionSchema>

export async function createSaleAction(
  payload: SaleActionPayload,
): Promise<{ success: boolean; error?: string | null; data?: any }> {
  const supabase = createClient()

  const validationResult = saleActionSchema.safeParse(payload)
  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    let errorMessage = "Geçersiz veri: "
    for (const key in errors) {
      // @ts-ignore
      errorMessage += `${key}: ${errors[key].join(", ")}. `
    }
    return {
      success: false,
      error: errorMessage.trim(),
    }
  }

  const { data: validatedData } = validationResult
  const itemsToProcess = validatedData.items.map(({ product_name, ...item }) => item)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user || !user.email) {
    return {
      success: false,
      error: "Kullanıcı yetkilendirmesi başarısız veya e-posta bilgisi eksik. Lütfen tekrar giriş yapın.",
    }
  }
  const userId = user.id
  const userEmail = user.email

  for (const item of itemsToProcess) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("quantity_on_hand, name")
      .eq("stock_code", item.product_stock_code)
      .single()

    if (productError || !product) {
      return { success: false, error: `Ürün bulunamadı: ${item.product_stock_code}` }
    }
    if ((product.quantity_on_hand || 0) < item.quantity) {
      return {
        success: false,
        error: `Yetersiz stok: ${product.name} (Stok Kodu: ${item.product_stock_code}). Mevcut: ${
          product.quantity_on_hand || 0
        }, İstenen: ${item.quantity}`,
      }
    }
  }

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert([
      {
        customer_mid: validatedData.customer_mid,
        total_amount: validatedData.total_amount,
        discount_amount: validatedData.discount_amount,
        tax_amount: validatedData.tax_amount,
        final_amount: validatedData.final_amount,
        payment_method: validatedData.payment_method,
        sale_currency: validatedData.sale_currency,
        status: validatedData.is_installment ? "pending" : "completed",
        notes: validatedData.notes,
        is_installment: validatedData.is_installment,
        installment_count: validatedData.is_installment ? validatedData.installment_count : null,
      },
    ])
    .select()
    .single()

  if (saleError) {
    console.error("Satış kaydı oluşturulurken hata:", saleError)
    return { success: false, error: `Satış kaydı oluşturulamadı: ${saleError.message}` }
  }

  const saleItemsToInsert = itemsToProcess.map((item) => ({
    sale_id: sale.id,
    ...item,
  }))

  const { error: itemsError } = await supabase.from("sale_items").insert(saleItemsToInsert)

  if (itemsError) {
    console.error("Satış kalemleri eklenirken hata:", itemsError)
    await supabase.from("sales").delete().eq("id", sale.id)
    return { success: false, error: `Satış kalemleri eklenemedi: ${itemsError.message}` }
  }

  for (const item of itemsToProcess) {
    const { data: product, error: productFetchError } = await supabase
      .from("products")
      .select("quantity_on_hand")
      .eq("stock_code", item.product_stock_code)
      .single()

    if (productFetchError || !product) {
      console.error(`Stok güncellenirken ürün bulunamadı: ${item.product_stock_code}`, productFetchError)
      continue
    }

    const currentQuantityOnHand = product.quantity_on_hand || 0
    const newQuantityOnHand = currentQuantityOnHand - item.quantity

    const { error: stockUpdateError } = await supabase
      .from("products")
      .update({ quantity_on_hand: newQuantityOnHand })
      .eq("stock_code", item.product_stock_code)

    if (stockUpdateError) {
      console.error(`Ürün stoku güncellenirken hata (${item.product_stock_code}):`, stockUpdateError)
      continue
    }

    const { data: productDetailsForAlert, error: productDetailsError } = await supabase
      .from("products")
      .select("min_stock_level")
      .eq("stock_code", item.product_stock_code)
      .single()

    if (!productDetailsError && productDetailsForAlert) {
      await checkAndManageLowStockAlert(
        supabase,
        item.product_stock_code,
        newQuantityOnHand,
        productDetailsForAlert.min_stock_level,
      )
    }

    await supabase.from("inventory_movements").insert({
      product_stock_code: item.product_stock_code,
      movement_type: "sale",
      quantity_changed: -item.quantity,
      quantity_after_movement: newQuantityOnHand,
      notes: `Satış #${sale.id}`,
      user_id: userId,
      user_email: userEmail,
      reference_document_id: sale.id.toString(),
      reference_document_type: "sales",
    })
  }

  if (validatedData.is_installment && validatedData.installment_count && validatedData.installment_count > 0) {
    const installmentAmount = validatedData.final_amount / validatedData.installment_count
    const installmentsToInsert = []
    const saleDate = new Date(sale.created_at || Date.now())

    for (let i = 0; i < validatedData.installment_count; i++) {
      installmentsToInsert.push({
        sale_id: sale.id,
        due_date: formatISO(addMonths(saleDate, i + 1), { representation: "date" }),
        amount: installmentAmount,
        status: "pending",
      })
    }
    await supabase.from("payment_installments").insert(installmentsToInsert)
  }

  revalidatePath("/sales")
  revalidatePath(`/sales/${sale.id}`)
  revalidatePath("/inventory")
  revalidatePath("/inventory/alerts")
  itemsToProcess.forEach((item) => {
    revalidatePath(`/products/${item.product_stock_code}`)
  })

  return { success: true, data: sale }
}

export async function deleteSaleAction(saleId: number): Promise<{ success: boolean; error?: string | null }> {
  if (!saleId) {
    return { success: false, error: "Satış ID'si gereklidir." }
  }
  const supabase = createClient()
  const { error } = await supabase
    .from("sales")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", saleId)
    .is("deleted_at", null)

  if (error) {
    return { success: false, error: `Satış arşivlenemedi: ${error.message}` }
  }
  revalidatePath("/sales")
  revalidatePath(`/sales/${saleId}`)
  return { success: true }
}

export async function updateSaleStatusAction(
  saleId: number,
  status: string,
): Promise<{ success: boolean; error?: string | null }> {
  if (!saleId) {
    return { success: false, error: "Satış ID'si gereklidir." }
  }
  const validStatuses = ["pending", "completed", "cancelled", "refunded"]
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Geçersiz satış durumu." }
  }
  const supabase = createClient()
  const { error } = await supabase.from("sales").update({ status }).eq("id", saleId)

  if (error) {
    return { success: false, error: error.message }
  }
  revalidatePath("/sales")
  revalidatePath(`/sales/${saleId}`)
  return { success: true }
}

export async function markInstallmentAsPaidAction(
  installmentId: number,
  saleId: number,
): Promise<{ success: boolean; error?: string | null }> {
  if (!installmentId || !saleId) {
    return { success: false, error: "Taksit ve Satış ID'si gereklidir." }
  }
  const supabase = createClient()
  const { data: installment, error: fetchError } = await supabase
    .from("payment_installments")
    .select("status")
    .eq("id", installmentId)
    .single()

  if (fetchError || !installment) {
    return { success: false, error: "Taksit bilgisi bulunamadı." }
  }
  if (installment.status === "paid") {
    return { success: false, error: "Bu taksit zaten ödenmiş." }
  }

  const { error: updateError } = await supabase
    .from("payment_installments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", installmentId)

  if (updateError) {
    return { success: false, error: `Taksit güncellenemedi: ${updateError.message}` }
  }

  const { data: pendingInstallments } = await supabase
    .from("payment_installments")
    .select("id")
    .eq("sale_id", saleId)
    .in("status", ["pending", "overdue"])

  if (pendingInstallments && pendingInstallments.length === 0) {
    await supabase.from("sales").update({ status: "completed" }).eq("id", saleId).eq("status", "pending")
  }

  revalidatePath(`/sales/${saleId}`)
  return { success: true }
}

export async function updateOverdueInstallmentsAction(
  saleId: number,
): Promise<{ success: boolean; updatedCount: number; error?: string | null }> {
  if (!saleId) {
    return { success: false, updatedCount: 0, error: "Satış ID'si gereklidir." }
  }
  const supabase = createClient()
  const today = startOfDay(new Date())
  const { data: overdueInstallments, error: fetchError } = await supabase
    .from("payment_installments")
    .select("id, due_date")
    .eq("sale_id", saleId)
    .eq("status", "pending")

  if (fetchError || !overdueInstallments || overdueInstallments.length === 0) {
    return { success: true, updatedCount: 0, error: fetchError?.message }
  }

  const installmentsToUpdate = overdueInstallments
    .filter((inst) => isBefore(new Date(inst.due_date), today))
    .map((inst) => inst.id)

  if (installmentsToUpdate.length === 0) {
    return { success: true, updatedCount: 0 }
  }

  const { error: updateError } = await supabase
    .from("payment_installments")
    .update({ status: "overdue" })
    .in("id", installmentsToUpdate)

  if (updateError) {
    return { success: false, updatedCount: 0, error: `Gecikmiş taksitler güncellenemedi: ${updateError.message}` }
  }

  if (installmentsToUpdate.length > 0) {
    revalidatePath(`/sales/${saleId}`)
  }
  return { success: true, updatedCount: installmentsToUpdate.length }
}
