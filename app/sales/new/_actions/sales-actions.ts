"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { isBefore, startOfDay } from "date-fns"

const saleItemSchema = z.object({
  product_stock_code: z.string().min(1),
  quantity: z.number().min(1),
  unit_price: z.number().min(0),
  vat_rate: z.number().min(0),
})

const saleSchema = z.object({
  customer_mid: z.string().nullable(),
  items: z.array(saleItemSchema).min(1, "En az bir ürün eklenmelidir."),
  payment_method: z.string().min(1, "Ödeme yöntemi zorunludur."),
  is_installment: z.boolean(),
  installment_count: z.number().nullable(),
  discount_amount: z.number().min(0),
  notes: z.string().nullable(),
  total_amount: z.number(),
  tax_amount: z.number(),
  final_amount: z.number(),
})

export async function createSaleAction(saleData: z.infer<typeof saleSchema>) {
  const supabase = createClient()

  const validatedSale = saleSchema.safeParse(saleData)
  if (!validatedSale.success) {
    return { success: false, error: "Geçersiz satış verileri." }
  }

  const { data: sale, error } = await supabase.rpc("create_sale_and_update_stock", {
    p_customer_mid: validatedSale.data.customer_mid === "no_customer" ? null : validatedSale.data.customer_mid,
    p_total_amount: validatedSale.data.total_amount,
    p_discount_amount: validatedSale.data.discount_amount,
    p_tax_amount: validatedSale.data.tax_amount,
    p_final_amount: validatedSale.data.final_amount,
    p_payment_method: validatedSale.data.payment_method,
    p_status: validatedSale.data.is_installment ? "pending_installment" : "completed",
    p_notes: validatedSale.data.notes,
    p_is_installment: validatedSale.data.is_installment,
    p_installment_count: validatedSale.data.installment_count,
    p_sale_items: validatedSale.data.items,
  })

  if (error) {
    console.error("Error creating sale:", error)
    return { success: false, error: `Satış oluşturulurken bir hata oluştu: ${error.message}` }
  }

  revalidatePath("/sales")
  revalidatePath("/inventory")
  revalidatePath("/financials")

  return { success: true, data: { id: sale } }
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
