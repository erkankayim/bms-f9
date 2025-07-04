"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import * as z from "zod"
import { addMonths, formatISO } from "date-fns"

// Formdan gelecek her bir ürün kalemi için şema
const saleItemSchema = z.object({
  product_stock_code: z.string().min(1, "Ürün seçimi zorunludur."),
  quantity: z.coerce.number().positive("Miktar pozitif olmalıdır."),
  unit_price: z.coerce.number().nonnegative("Birim fiyat negatif olamaz."),
  vat_rate: z.coerce.number().min(0).max(100, "KDV oranı 0-100 arasında olmalıdır."),
  discount_rate: z.coerce.number().min(0).max(100, "İskonto oranı 0-100 arasında olmalıdır."),
})

// Ana satış eylemi şeması
const createSaleSchema = z.object({
  customer_mid: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1, "En az bir ürün eklenmelidir."),
  payment_method: z.string().min(1, "Ödeme yöntemi zorunludur."),
  is_installment: z.boolean(),
  installment_count: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
})

export async function createSaleAction(payload: z.infer<typeof createSaleSchema>) {
  const validationResult = createSaleSchema.safeParse(payload)
  if (!validationResult.success) {
    return { success: false, error: "Geçersiz form verileri." }
  }

  const { customer_mid, items, payment_method, is_installment, installment_count, notes } = validationResult.data

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Yetkilendirme hatası." }
  }

  // İşlem mantığı (Transaction önerilir, şimdilik adımlara ayırıyoruz)
  try {
    // 1. Stokları kontrol et
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("quantity_on_hand, name")
        .eq("stock_code", item.product_stock_code)
        .single()
      if (!product || product.quantity_on_hand < item.quantity) {
        return { success: false, error: `Yetersiz stok: ${product?.name || item.product_stock_code}` }
      }
    }

    // 2. Toplamları hesapla
    let total_amount = 0
    let tax_amount = 0
    let discount_amount = 0

    for (const item of items) {
      const item_gross_total = item.unit_price * item.quantity
      const item_discount = item_gross_total * (item.discount_rate / 100)
      const item_after_discount = item_gross_total - item_discount
      const item_tax = item_after_discount * (item.vat_rate / 100)

      total_amount += item_after_discount
      tax_amount += item_tax
      discount_amount += item_discount
    }
    const final_amount = total_amount + tax_amount

    // 3. Satış kaydını oluştur
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        customer_mid,
        total_amount,
        tax_amount,
        discount_amount,
        final_amount,
        payment_method,
        status: is_installment ? "pending_installment" : "completed",
        is_installment,
        installment_count: is_installment ? installment_count : null,
        notes,
        sale_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (saleError) throw saleError

    // 4. Satış kalemlerini ve stok hareketlerini oluştur
    for (const item of items) {
      const { error: itemError } = await supabase.from("sale_items").insert({
        sale_id: sale.id,
        product_stock_code: item.product_stock_code,
        quantity: item.quantity,
        unit_price: item.unit_price,
        vat_rate: item.vat_rate,
        discount_rate: item.discount_rate,
        // Diğer hesaplanmış alanlar eklenebilir
      })
      if (itemError) throw itemError

      // Stok güncelleme (RPC veya doğrudan update)
      const { data: product } = await supabase
        .from("products")
        .select("quantity_on_hand")
        .eq("stock_code", item.product_stock_code)
        .single()

      const newQuantity = (product?.quantity_on_hand || 0) - item.quantity

      const { error: stockUpdateError } = await supabase
        .from("products")
        .update({ quantity_on_hand: newQuantity })
        .eq("stock_code", item.product_stock_code)
      if (stockUpdateError) throw stockUpdateError
    }

    // 5. Taksitleri oluştur
    if (is_installment && installment_count && installment_count > 0) {
      const installmentAmount = final_amount / installment_count
      const installments = Array.from({ length: installment_count }, (_, i) => ({
        sale_id: sale.id,
        due_date: formatISO(addMonths(new Date(), i + 1)),
        amount: installmentAmount,
        status: "pending",
      }))
      const { error: installmentError } = await supabase.from("payment_installments").insert(installments)
      if (installmentError) throw installmentError
    }

    revalidatePath("/sales")
    revalidatePath("/inventory")
    return { success: true, data: sale }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getProductsForSale() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .select("stock_code, name, sale_price, vat_rate, quantity_on_hand")
    .is("deleted_at", null)
    .gt("quantity_on_hand", 0)
  if (error) return []
  return data
}

export async function getCustomersForSale() {
  const supabase = createClient()
  const { data, error } = await supabase.from("customers").select("mid, contact_name").is("deleted_at", null)
  if (error) return []
  return data
}
