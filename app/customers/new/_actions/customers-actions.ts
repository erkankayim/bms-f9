"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Server-side validation schema
const customerSchema = z.object({
  mid: z
    .string()
    .min(1, "Müşteri ID zorunludur")
    .max(50, "Müşteri ID en fazla 50 karakter olabilir")
    .regex(/^[a-zA-Z0-9_-]+$/, "Müşteri ID sadece harf, rakam, tire ve alt çizgi içerebilir"),
  contact_name: z
    .string()
    .min(2, "İletişim adı en az 2 karakter olmalıdır")
    .max(100, "İletişim adı en fazla 100 karakter olabilir"),
  company_name: z.string().max(100).nullable().optional(),
  email: z.string().email("Geçerli bir email adresi giriniz").max(100).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  city: z.string().max(50).nullable().optional(),
  province: z.string().max(50).nullable().optional(),
  postal_code: z.string().max(10).nullable().optional(),
  country: z.string().max(50).nullable().optional(),
  tax_number: z.string().max(20).nullable().optional(),
  customer_group: z.string().max(50).nullable().optional(),
  balance: z.number().min(-999999.99).max(999999.99).optional(),
  notes: z.string().max(1000).nullable().optional(),
  service_name: z.string().max(100).nullable().optional(),
})

type CustomerData = z.infer<typeof customerSchema>

export async function createCustomer(data: CustomerData) {
  try {
    // Validate the data
    const validatedData = customerSchema.parse(data)

    const supabase = createClient()

    // Check if customer ID already exists
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("mid")
      .eq("mid", validatedData.mid)
      .single()

    if (existingCustomer) {
      throw new Error("Bu müşteri ID zaten kullanılıyor. Lütfen farklı bir ID seçin.")
    }

    // Insert the new customer
    const { error } = await supabase.from("customers").insert([validatedData])

    if (error) {
      console.error("Database error:", error)
      if (error.code === "23505") {
        // Unique constraint violation
        throw new Error("Bu müşteri ID zaten kullanılıyor. Lütfen farklı bir ID seçin.")
      }
      throw new Error("Müşteri kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.")
    }

    revalidatePath("/customers")
    return { success: true }
  } catch (error) {
    console.error("Create customer error:", error)

    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      throw new Error(`Doğrulama hatası: ${fieldErrors}`)
    }

    throw error instanceof Error ? error : new Error("Beklenmeyen bir hata oluştu")
  }
}

export async function updateCustomer(customerId: string, data: Partial<CustomerData>) {
  try {
    // Validate the data (excluding mid for updates)
    const updateSchema = customerSchema.omit({ mid: true })
    const validatedData = updateSchema.parse(data)

    const supabase = createClient()

    // Update the customer
    const { error } = await supabase
      .from("customers")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("mid", customerId)

    if (error) {
      console.error("Database error:", error)
      throw new Error("Müşteri güncellenirken bir hata oluştu. Lütfen tekrar deneyin.")
    }

    revalidatePath("/customers")
    revalidatePath(`/customers/${customerId}`)
    return { success: true }
  } catch (error) {
    console.error("Update customer error:", error)

    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      throw new Error(`Doğrulama hatası: ${fieldErrors}`)
    }

    throw error instanceof Error ? error : new Error("Beklenmeyen bir hata oluştu")
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    const supabase = createClient()

    // Soft delete - set deleted_at timestamp
    const { error } = await supabase
      .from("customers")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("mid", customerId)

    if (error) {
      console.error("Database error:", error)
      throw new Error("Müşteri silinirken bir hata oluştu. Lütfen tekrar deneyin.")
    }

    revalidatePath("/customers")
    return { success: true }
  } catch (error) {
    console.error("Delete customer error:", error)
    throw error instanceof Error ? error : new Error("Beklenmeyen bir hata oluştu")
  }
}

export async function restoreCustomer(customerId: string) {
  try {
    const supabase = createClient()

    // Restore customer - remove deleted_at timestamp
    const { error } = await supabase
      .from("customers")
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("mid", customerId)

    if (error) {
      console.error("Database error:", error)
      throw new Error("Müşteri geri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.")
    }

    revalidatePath("/customers")
    revalidatePath(`/customers/${customerId}`)
    return { success: true }
  } catch (error) {
    console.error("Restore customer error:", error)
    throw error instanceof Error ? error : new Error("Beklenmeyen bir hata oluştu")
  }
}

// Updated function to properly update an existing customer
export async function updateCustomerAction(
  originalCustomerId: string,
  data: CustomerData,
): Promise<{ success: boolean; error?: string | null; data?: any; fieldErrors?: any }> {
  const supabase = createClient()

  if (!originalCustomerId) {
    return {
      success: false,
      error: "Orijinal müşteri ID bulunamadı",
    }
  }

  // Validate data
  const validationResult = customerSchema.safeParse(data)
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

export async function addCustomerAction(
  data: CustomerData,
): Promise<{ success: boolean; error?: string | null; data?: any; fieldErrors?: any }> {
  const supabase = createClient()

  // Validate data with Zod schema
  const validationResult = customerSchema.safeParse(data)
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
