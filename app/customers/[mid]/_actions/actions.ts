"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteCustomer(customerId: string) {
  try {
    const supabase = createClient()

    console.log(`[deleteCustomer] Müşteri siliniyor: ${customerId}`)

    const { error } = await supabase
      .from("customers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("mid", customerId)
      .is("deleted_at", null)

    if (error) {
      console.error(`[deleteCustomer] Supabase hatası:`, error)
      return {
        success: false,
        error: `Müşteri silinemedi: ${error.message}`,
      }
    }

    console.log(`[deleteCustomer] Müşteri başarıyla silindi: ${customerId}`)

    revalidatePath("/customers")
    revalidatePath(`/customers/${customerId}`)

    return { success: true }
  } catch (error) {
    console.error(`[deleteCustomer] Beklenmeyen hata:`, error)
    return {
      success: false,
      error: "Beklenmeyen bir hata oluştu",
    }
  }
}

export async function restoreCustomer(customerId: string) {
  try {
    const supabase = createClient()

    console.log(`[restoreCustomer] Müşteri geri yükleniyor: ${customerId}`)

    const { error } = await supabase
      .from("customers")
      .update({ deleted_at: null })
      .eq("mid", customerId)
      .not("deleted_at", "is", null)

    if (error) {
      console.error(`[restoreCustomer] Supabase hatası:`, error)
      return {
        success: false,
        error: `Müşteri geri yüklenemedi: ${error.message}`,
      }
    }

    console.log(`[restoreCustomer] Müşteri başarıyla geri yüklendi: ${customerId}`)

    revalidatePath("/customers")
    revalidatePath(`/customers/${customerId}`)

    return { success: true }
  } catch (error) {
    console.error(`[restoreCustomer] Beklenmeyen hata:`, error)
    return {
      success: false,
      error: "Beklenmeyen bir hata oluştu",
    }
  }
}
