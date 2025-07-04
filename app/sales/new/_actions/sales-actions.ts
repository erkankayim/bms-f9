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
  unit_price_currency: z.string().optional().nullable(),
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

  // 1. Get current user for inventory movement tracking
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

  // 2. Check stock for all items BEFORE creating the sale
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

  // 3. Create the sale record
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
        status: validatedData.is_installment ? "pending_installment" : "completed",
        notes: validatedData.notes,
        is_installment: validatedData.is_installment,
        installment_count: validatedData.is_installment ? validatedData.installment_count : null,
        sale_date: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (saleError) {
    console.error("Satış kaydı oluşturulurken hata:", saleError)
    return { success: false, error: `Satış kaydı oluşturulamadı: ${saleError.message}` }
  }

  // 4. Create sale items
  const saleItemsToInsert = itemsToProcess.map((item) => ({
    sale_id: sale.id,
    ...item,
  }))

  const { error: itemsError } = await supabase.from("sale_items").insert(saleItemsToInsert)

  if (itemsError) {
    console.error("Satış kalemleri eklenirken hata:", itemsError)
    // Rollback: Delete the created sale
    await supabase.from("sales").delete().eq("id", sale.id)
    return { success: false, error: `Satış kalemleri eklenemedi: ${itemsError.message}` }
  }

  // 5. Update stock and create inventory movements for each item
  for (const item of itemsToProcess) {
    const { data: product, error: productFetchError } = await supabase
      .from("products")
      .select("quantity_on_hand")
      .eq("stock_code", item.product_stock_code)
      .single()

    // This check should ideally not fail if the pre-check passed, but good for safety
    if (productFetchError || !product) {
      console.error(`Stok güncellenirken ürün bulunamadı (bu bir sorun): ${item.product_stock_code}`, productFetchError)
      // More complex rollback needed here if some items processed and others fail.
      // For now, we'll log and the sale might be partially inconsistent.
      // Ideally, this whole block (sale, items, stock, movements) should be a transaction.
      continue // Skip this item, or return an error
    }

    const currentQuantityOnHand = product.quantity_on_hand || 0
    const newQuantityOnHand = currentQuantityOnHand - item.quantity

    const { error: stockUpdateError } = await supabase
      .from("products")
      .update({ quantity_on_hand: newQuantityOnHand })
      .eq("stock_code", item.product_stock_code)

    if (stockUpdateError) {
      console.error(`Ürün stoku güncellenirken hata (${item.product_stock_code}):`, stockUpdateError)
      // Rollback is more complex here. The sale is created.
      // Consider logging this for manual correction or a more robust rollback strategy.
      // For now, we continue, but this item's stock won't be updated.
      continue
    }

    // Düşük stok uyarısını kontrol et ve yönet
    const { data: productDetailsForAlert, error: productDetailsError } = await supabase
      .from("products")
      .select("min_stock_level")
      .eq("stock_code", item.product_stock_code)
      .single()

    if (productDetailsError) {
      console.warn(
        `[createSaleAction] Minimum stok seviyesi alınamadı (${item.product_stock_code}): ${productDetailsError.message}`,
      )
      // Uyarı oluşturma adımını atla ama işleme devam et
    } else if (productDetailsForAlert) {
      const alertResult = await checkAndManageLowStockAlert(
        supabase,
        item.product_stock_code,
        newQuantityOnHand, // Bu, döngü içinde hesaplanan yeni stok miktarı olmalı
        productDetailsForAlert.min_stock_level,
      )
      if (alertResult.error) {
        console.warn(
          `[createSaleAction] Düşük stok uyarısı yönetilirken hata (${item.product_stock_code}): ${alertResult.error}`,
        )
        // Bu bir uyarı, ana işlem başarısız olmamalı
      } else if (alertResult.alertCreated) {
        console.log(`[createSaleAction] Düşük stok uyarısı oluşturuldu: ${item.product_stock_code}`)
        revalidatePath("/inventory/alerts") // Uyarılar sayfasını yenile (varsayımsal)
      } else if (alertResult.alertResolved) {
        console.log(`[createSaleAction] Düşük stok uyarısı çözüldü: ${item.product_stock_code}`)
        revalidatePath("/inventory/alerts") // Uyarılar sayfasını yenile
      }
    }

    const { error: movementError } = await supabase.from("inventory_movements").insert({
      product_stock_code: item.product_stock_code,
      movement_type: "sale", // New movement type
      quantity_changed: -item.quantity, // Negative value for stock decrease
      quantity_after_movement: newQuantityOnHand,
      notes: `Satış #${sale.id}`,
      user_id: userId,
      user_email: userEmail,
      reference_document_id: sale.id.toString(), // Link to the sale
      reference_document_type: "sales",
    })

    if (movementError) {
      console.error(`Stok hareketi kaydedilirken hata (${item.product_stock_code}):`, movementError)
      // Log for manual correction.
    }
  }

  // 6. Create installments if applicable (existing logic)
  if (validatedData.is_installment && validatedData.installment_count && validatedData.installment_count > 1) {
    const installmentAmount = validatedData.final_amount / validatedData.installment_count
    const installmentsToInsert = []
    const saleDate = new Date(sale.created_at || Date.now()) // Use sale creation date

    for (let i = 1; i <= validatedData.installment_count; i++) {
      installmentsToInsert.push({
        sale_id: sale.id,
        installment_number: i,
        amount: installmentAmount,
        due_date: formatISO(addMonths(saleDate, i), { representation: "date" }),
        status: "pending",
      })
    }
    const { error: installmentError } = await supabase.from("payment_installments").insert(installmentsToInsert)
    if (installmentError) {
      console.error("Taksitler oluşturulurken hata:", installmentError)
      // Non-critical for stock, log and continue
    }
  }

  revalidatePath("/sales")
  revalidatePath(`/sales/${sale.id}`)
  revalidatePath("/inventory") // Revalidate inventory page as stocks changed
  revalidatePath("/inventory/alerts")
  itemsToProcess.forEach((item) => {
    revalidatePath(`/products/${item.product_stock_code}`) // Revalidate individual product pages
  })

  return { success: true, data: sale }
}

export async function getProductsForSale() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("products")
      .select("stock_code, product_name, sale_price, current_stock, tax_rate")
      .gt("current_stock", 0)
      .is("deleted_at", null)
      .order("product_name")

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error:", error)
    return []
  }
}

export async function getCustomersForSale() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("customers")
      .select("mid, contact_name, email, phone")
      .is("deleted_at", null)
      .order("contact_name")

    if (error) {
      console.error("Error fetching customers:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error:", error)
    return []
  }
}

// Mevcut deleteSaleAction, restoreSaleAction, updateSaleStatusAction,
// markInstallmentAsPaidAction, updateOverdueInstallmentsAction fonksiyonları burada kalacak...
// Onlarda şimdilik bir değişiklik yapmıyoruz.

export async function deleteSaleAction(saleId: number): Promise<{ success: boolean; error?: string | null }> {
  if (!saleId) {
    return { success: false, error: "Satış ID'si gereklidir." }
  }

  const supabase = createClient()
  // TODO: Satış silindiğinde (soft delete) stoklar geri iade edilmeli mi? Bu iş kuralına bağlı.
  // Şimdilik sadece satışı siliyoruz, stoklar etkilenmiyor.
  const { error } = await supabase
    .from("sales")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", saleId)
    .is("deleted_at", null)

  if (error) {
    console.error("Satış arşivlenirken hata:", error)
    return { success: false, error: `Satış arşivlenemedi: ${error.message}` }
  }

  revalidatePath("/sales")
  revalidatePath(`/sales/${saleId}`)

  return { success: true }
}

export async function restoreSaleAction(saleId: number): Promise<{ success: boolean; error?: string | null }> {
  if (!saleId) {
    return { success: false, error: "Satış ID'si gereklidir." }
  }
  const supabase = createClient()
  // TODO: Satış geri yüklendiğinde stoklar tekrar düşürülmeli mi?
  const { error } = await supabase
    .from("sales")
    .update({ deleted_at: null })
    .eq("id", saleId)
    .not("deleted_at", "is", null)

  if (error) {
    console.error("Satış geri yüklenirken hata:", error)
    return { success: false, error: `Satış geri yüklenemedi: ${error.message}` }
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

  const validStatuses = ["pending", "completed", "cancelled", "refunded", "pending_installment"]
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Geçersiz satış durumu." }
  }

  const supabase = createClient()
  // TODO: Satış durumu 'cancelled' veya 'refunded' olduğunda stoklar iade edilmeli.
  // Eğer 'completed' yapılıyorsa ve daha önce stok düşülmediyse (örn: pending'den geliyorsa) düşülmeli.
  // Bu kısım daha detaylı bir iş akışı gerektirir.

  const { error } = await supabase.from("sales").update({ status }).eq("id", saleId)

  if (error) {
    console.error("Satış durumu güncellenirken hata:", error)
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
  if (!installmentId) {
    return { success: false, error: "Taksit ID'si gereklidir." }
  }
  if (!saleId) {
    return { success: false, error: "Satış ID'si gereklidir." }
  }

  const supabase = createClient()

  const { data: installment, error: fetchError } = await supabase
    .from("payment_installments")
    .select("status")
    .eq("id", installmentId)
    .single()

  if (fetchError || !installment) {
    console.error("Taksit bilgisi getirilirken hata:", fetchError)
    return { success: false, error: "Taksit bilgisi bulunamadı veya getirilemedi." }
  }

  if (installment.status === "paid") {
    return { success: false, error: "Bu taksit zaten ödenmiş." }
  }

  const { error: updateError } = await supabase
    .from("payment_installments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", installmentId)

  if (updateError) {
    console.error("Taksit güncellenirken hata:", updateError)
    return { success: false, error: `Taksit güncellenemedi: ${updateError.message}` }
  }

  const { data: pendingInstallments, error: pendingError } = await supabase
    .from("payment_installments")
    .select("id")
    .eq("sale_id", saleId)
    .in("status", ["pending", "overdue"])

  if (pendingError) {
    console.warn("Bekleyen taksitler kontrol edilirken hata:", pendingError.message)
  } else if (pendingInstallments && pendingInstallments.length === 0) {
    // Tüm taksitler ödendi, ana satışı 'completed' yap
    // ve eğer stok düşümü bu aşamada yapılacaksa burada yapılmalı.
    // Şimdilik createSaleAction'da yapıyoruz.
    const { error: saleStatusError } = await supabase
      .from("sales")
      .update({ status: "completed" })
      .eq("id", saleId)
      .eq("status", "pending_installment") // Sadece pending_installment ise completed yap

    if (saleStatusError) {
      console.warn("Ana satış durumu güncellenirken hata (tüm taksitler ödendi):", saleStatusError.message)
    }
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

  if (fetchError) {
    console.error("Gecikmiş taksitler sorgulanırken hata:", fetchError)
    return { success: false, updatedCount: 0, error: "Taksitler sorgulanırken bir hata oluştu." }
  }

  if (!overdueInstallments || overdueInstallments.length === 0) {
    return { success: true, updatedCount: 0 }
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
    console.error("Gecikmiş taksitler güncellenirken hata:", updateError)
    return { success: false, updatedCount: 0, error: `Gecikmiş taksitler güncellenemedi: ${updateError.message}` }
  }

  if (installmentsToUpdate.length > 0) {
    revalidatePath(`/sales/${saleId}`)
  }

  return { success: true, updatedCount: installmentsToUpdate.length }
}

// decrement_product_stock RPC fonksiyonu yorum satırı olarak kalabilir,
// çünkü stok güncelleme ve hareket kaydını action içinde yaptık.
/*
CREATE OR REPLACE FUNCTION decrement_product_stock(p_stock_code TEXT, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
UPDATE products
SET quantity_on_hand = quantity_on_hand - p_quantity
WHERE stock_code = p_stock_code AND quantity_on_hand >= p_quantity;

IF NOT FOUND THEN
-- Stok yetersizse veya ürün bulunamazsa bir şey yapma veya hata fırlat
END IF;
END;
$$ LANGUAGE plpgsql;
*/
