"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import * as z from "zod"

// Schema for validation, matching the form schema
const customerFormSchema = z.object({
  mid: z
    .string()
    .min(1, "Müşteri ID gereklidir")
    .max(50, "Müşteri ID en fazla 50 karakter olabilir")
    .regex(/^[A-Za-z0-9_-]+$/, "Müşteri ID sadece harf, rakam, tire ve alt çizgi içerebilir"),
  service_name: z.string().max(100, "Şirket/Servis adı en fazla 100 karakter olabilir").optional().nullable(),
  contact_name: z
    .string()
    .min(1, "İletişim adı gereklidir")
    .min(2, "İletişim adı en az 2 karakter olmalıdır")
    .max(100, "İletişim adı en fazla 100 karakter olabilir"),
  email: z
    .string()
    .email("Geçersiz e-posta adresi formatı")
    .max(100, "E-posta adresi en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal(""))
    .nullable(),
  phone: z
    .string()
    .max(20, "Telefon numarası en fazla 20 karakter olabilir")
    .regex(/^[0-9\s\-+$$$$]*$/, "Telefon numarası sadece rakam ve telefon karakterleri içerebilir")
    .optional()
    .nullable(),
  address: z.string().max(500, "Adres en fazla 500 karakter olabilir").optional().nullable(),
  city: z.string().max(50, "Şehir adı en fazla 50 karakter olabilir").optional().nullable(),
  province: z.string().max(50, "İl adı en fazla 50 karakter olabilir").optional().nullable(),
  postal_code: z
    .string()
    .max(10, "Posta kodu en fazla 10 karakter olabilir")
    .regex(/^[0-9]*$/, "Posta kodu sadece rakam içerebilir")
    .optional()
    .nullable(),
  tax_office: z.string().max(100, "Vergi dairesi adı en fazla 100 karakter olabilir").optional().nullable(),
  tax_number: z
    .string()
    .max(20, "Vergi numarası en fazla 20 karakter olabilir")
    .regex(/^[0-9]*$/, "Vergi numarası sadece rakam içerebilir")
    .optional()
    .nullable(),
  customer_group: z.string().max(50, "Müşteri grubu en fazla 50 karakter olabilir").optional().nullable(),
  balance: z.coerce
    .number()
    .min(-999999.99, "Bakiye çok düşük")
    .max(999999.99, "Bakiye çok yüksek")
    .optional()
    .default(0)
    .nullable(),
  notes: z.string().max(1000, "Notlar en fazla 1000 karakter olabilir").optional().nullable(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

export async function addCustomerAction(
  data: CustomerFormValues,
): Promise<{ success: boolean; error?: string | null; data?: any; fieldErrors?: any }> {
  const supabase = createClient()

  // Validate data with Zod schema
  const validationResult = customerFormSchema.safeParse(data)
  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors
    console.error("Validation errors:", fieldErrors)

    // Return detailed field errors
    return {
      success: false,
      error: "Form verilerinde hatalar bulundu. Lütfen aşağıdaki alanları kontrol edin.",
      fieldErrors: fieldErrors,
    }
  }

  const { data: newCustomer, error } = await supabase
    .from("customers")
    .insert([
      {
        mid: validationResult.data.mid,
        service_name: validationResult.data.service_name,
        contact_name: validationResult.data.contact_name,
        email: validationResult.data.email,
        phone: validationResult.data.phone,
        address: validationResult.data.address,
        city: validationResult.data.city,
        province: validationResult.data.province,
        postal_code: validationResult.data.postal_code,
        tax_office: validationResult.data.tax_office,
        tax_number: validationResult.data.tax_number,
        customer_group: validationResult.data.customer_group,
        balance: validationResult.data.balance,
        notes: validationResult.data.notes,
        // created_at and updated_at will be set by default by Postgres
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error inserting customer:", error)
    // Check for specific Supabase errors, e.g., unique constraint violation for 'mid'
    if (error.code === "23505") {
      // PostgreSQL unique violation error code
      if (error.message.includes("customers_pkey")) {
        // Check if it's the primary key (mid)
        return { success: false, error: `Customer ID "${validationResult.data.mid}" already exists.` }
      }
    }
    return { success: false, error: error.message }
  }

  // Revalidate the customers list page so it shows the new customer
  revalidatePath("/customers")
  revalidatePath(`/customers/${validationResult.data.mid}`)

  return { success: true, data: newCustomer }
}

// Updated function to properly update an existing customer
export async function updateCustomerAction(
  originalCustomerId: string,
  data: CustomerFormValues,
): Promise<{ success: boolean; error?: string | null; data?: any; fieldErrors?: any }> {
  const supabase = createClient()

  if (!originalCustomerId) {
    return {
      success: false,
      error: "Orijinal müşteri ID bulunamadı",
    }
  }

  // Validate data
  const validationResult = customerFormSchema.safeParse(data)
  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors
    console.error("Validation errors:", fieldErrors)

    // Return detailed field errors
    return {
      success: false,
      error: "Form verilerinde hatalar bulundu. Lütfen aşağıdaki alanları kontrol edin.",
      fieldErrors: fieldErrors,
    }
  }

  try {
    // Check if the customer exists
    const { data: existingCustomer, error: fetchError } = await supabase
      .from("customers")
      .select("mid")
      .eq("mid", originalCustomerId)
      .single()

    if (fetchError || !existingCustomer) {
      return {
        success: false,
        error: "Güncellenecek müşteri bulunamadı",
      }
    }

    // If mid is being changed, we need to handle it carefully
    const newMid = validationResult.data.mid
    const isChangingMid = newMid !== originalCustomerId

    if (isChangingMid) {
      // Check if new mid already exists
      const { data: midExists } = await supabase.from("customers").select("mid").eq("mid", newMid).single()

      if (midExists) {
        return {
          success: false,
          error: `Müşteri ID "${newMid}" zaten kullanımda. Farklı bir ID seçin.`,
        }
      }
    }

    // Prepare update data
    const updateData = {
      mid: validationResult.data.mid,
      service_name: validationResult.data.service_name,
      contact_name: validationResult.data.contact_name,
      email: validationResult.data.email,
      phone: validationResult.data.phone,
      address: validationResult.data.address,
      city: validationResult.data.city,
      province: validationResult.data.province,
      postal_code: validationResult.data.postal_code,
      tax_office: validationResult.data.tax_office,
      tax_number: validationResult.data.tax_number,
      customer_group: validationResult.data.customer_group,
      balance: validationResult.data.balance,
      notes: validationResult.data.notes,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedCustomer, error } = await supabase
      .from("customers")
      .update(updateData)
      .eq("mid", originalCustomerId)
      .select()
      .single()

    if (error) {
      console.error("Error updating customer:", error)
      if (error.code === "23505") {
        return { success: false, error: `Müşteri ID "${newMid}" zaten kullanımda.` }
      }
      return { success: false, error: error.message }
    }

    // Revalidate paths
    revalidatePath("/customers")
    revalidatePath(`/customers/${originalCustomerId}`)
    if (isChangingMid) {
      revalidatePath(`/customers/${newMid}`)
    }

    return { success: true, data: updatedCustomer }
  } catch (error: any) {
    console.error("Unexpected error updating customer:", error)
    return {
      success: false,
      error: "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.",
    }
  }
}
