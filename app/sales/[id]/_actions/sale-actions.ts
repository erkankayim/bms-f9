"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteSaleAction(saleId: number) {
  try {
    const supabase = await createClient()

    // Önce satış kalemlerini al (stok geri yüklemek için)
    const { data: saleItems, error: itemsError } = await supabase
      .from("sale_items")
      .select("stock_code, quantity")
      .eq("sale_id", saleId)

    if (itemsError) {
      console.error("Error fetching sale items:", itemsError)
      return { success: false, error: itemsError.message }
    }

    // Stokları geri yükle
    for (const item of saleItems || []) {
      const { error: stockError } = await supabase.rpc("update_product_stock", {
        p_stock_code: item.stock_code,
        p_quantity_change: item.quantity,
        p_movement_type: "sale_return",
        p_reference_id: saleId,
        p_notes: `Satış iptali #${saleId}`,
      })

      if (stockError) {
        console.error("Stock update error:", stockError)
      }
    }

    // Satış kalemlerini sil
    const { error: deleteItemsError } = await supabase.from("sale_items").delete().eq("sale_id", saleId)

    if (deleteItemsError) {
      console.error("Error deleting sale items:", deleteItemsError)
      return { success: false, error: deleteItemsError.message }
    }

    // Taksitleri sil
    const { error: deleteInstallmentsError } = await supabase
      .from("payment_installments")
      .delete()
      .eq("sale_id", saleId)

    if (deleteInstallmentsError) {
      console.error("Error deleting installments:", deleteInstallmentsError)
    }

    // Satışı sil
    const { error: deleteSaleError } = await supabase.from("sales").delete().eq("id", saleId)

    if (deleteSaleError) {
      console.error("Error deleting sale:", deleteSaleError)
      return { success: false, error: deleteSaleError.message }
    }

    revalidatePath("/sales")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateSaleStatusAction(saleId: number, status: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("sales").update({ status }).eq("id", saleId)

    if (error) {
      console.error("Error updating sale status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/sales/${saleId}`)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}
