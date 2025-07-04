"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface CustomerFormData {
  mid: string
  name: string
  email?: string
  phone?: string
  address?: string
  tax_number?: string
  tax_office?: string
  notes?: string
}

export async function createCustomerAction(formData: FormData) {
  const supabase = createClient()

  try {
    const customerData: CustomerFormData = {
      mid: formData.get("mid") as string,
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
      tax_number: (formData.get("tax_number") as string) || null,
      tax_office: (formData.get("tax_office") as string) || null,
      notes: (formData.get("notes") as string) || null,
    }

    // Validation
    if (!customerData.mid || !customerData.name) {
      return { success: false, message: "Müşteri ID ve isim zorunludur." }
    }

    // Check if customer with this MID already exists
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("mid")
      .eq("mid", customerData.mid)
      .single()

    if (existingCustomer) {
      return { success: false, message: "Bu müşteri ID zaten kullanılıyor." }
    }

    const { error } = await supabase.from("customers").insert([customerData])

    if (error) {
      console.error("Customer creation error:", error)
      return { success: false, message: `Müşteri oluşturulamadı: ${error.message}` }
    }

    revalidatePath("/customers")
    return { success: true, message: "Müşteri başarıyla oluşturuldu." }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Beklenmedik bir hata oluştu." }
  }
}

export async function updateCustomerAction(formData: FormData, originalCustomerId: string) {
  console.log(`[Update Action] Starting update for customer: ${originalCustomerId}`)

  const supabase = createClient()

  try {
    const customerData: Partial<CustomerFormData> = {
      mid: formData.get("mid") as string,
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
      tax_number: (formData.get("tax_number") as string) || null,
      tax_office: (formData.get("tax_office") as string) || null,
      notes: (formData.get("notes") as string) || null,
    }

    // Validation
    if (!customerData.mid || !customerData.name) {
      return { success: false, message: "Müşteri ID ve isim zorunludur." }
    }

    console.log(`[Update Action] Original ID: ${originalCustomerId}, New ID: ${customerData.mid}`)

    // Eğer MID değiştirilmişse, yeni MID'in kullanılıp kullanılmadığını kontrol et
    if (customerData.mid !== originalCustomerId) {
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("mid")
        .eq("mid", customerData.mid)
        .single()

      if (existingCustomer) {
        return { success: false, message: "Bu müşteri ID zaten kullanılıyor." }
      }
    }

    // Müşteriyi güncelle (orijinal ID ile)
    const { error } = await supabase.from("customers").update(customerData).eq("mid", originalCustomerId)

    if (error) {
      console.error("Customer update error:", error)
      return { success: false, message: `Müşteri güncellenemedi: ${error.message}` }
    }

    console.log(`[Update Action] Successfully updated customer: ${originalCustomerId}`)

    revalidatePath("/customers")
    revalidatePath(`/customers/${originalCustomerId}`)

    // Eğer MID değiştirilmişse yeni sayfaya yönlendir
    if (customerData.mid !== originalCustomerId) {
      revalidatePath(`/customers/${customerData.mid}`)
      redirect(`/customers/${customerData.mid}`)
    }

    return { success: true, message: "Müşteri başarıyla güncellendi." }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Beklenmedik bir hata oluştu." }
  }
}
