"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteCustomer(customerId: string) {
  try {
    console.log("Deleting customer:", customerId)

    const supabase = createClient()

    // Müşteriyi soft delete yap (deleted_at alanını güncelle)
    const { data, error } = await supabase
      .from("customers")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("mid", customerId)
      .select()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Veritabanı hatası: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("Müşteri bulunamadı")
    }

    console.log("Customer deleted successfully:", data)

    // Cache'i yenile
    revalidatePath("/customers")
    revalidatePath(`/customers/${customerId}`)

    return { success: true, message: "Müşteri başarıyla silindi" }
  } catch (error) {
    console.error("Delete customer error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Müşteri silinirken bir hata oluştu",
    }
  }
}

export async function restoreCustomer(customerId: string) {
  try {
    console.log("Restoring customer:", customerId)

    const supabase = createClient()

    // Müşteriyi geri yükle (deleted_at alanını null yap)
    const { data, error } = await supabase
      .from("customers")
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("mid", customerId)
      .select()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Veritabanı hatası: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("Müşteri bulunamadı")
    }

    console.log("Customer restored successfully:", data)

    // Cache'i yenile
    revalidatePath("/customers")
    revalidatePath(`/customers/${customerId}`)

    return { success: true, message: "Müşteri başarıyla geri yüklendi" }
  } catch (error) {
    console.error("Restore customer error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Müşteri geri yüklenirken bir hata oluştu",
    }
  }
}
