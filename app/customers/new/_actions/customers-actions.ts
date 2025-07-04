"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import * as z from "zod"

// Schema for validation, matching the form schema
const customerFormSchema = z.object({
  mid: z.string().min(1, "Customer ID is required"),
  service_name: z.string().optional().nullable(),
  contact_name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  tax_office: z.string().optional().nullable(),
  tax_number: z.string().optional().nullable(),
  customer_group: z.string().optional().nullable(),
  balance: z.coerce.number().optional().default(0).nullable(),
  notes: z.string().optional().nullable(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

export async function addCustomerAction(
  data: CustomerFormValues,
): Promise<{ success: boolean; error?: string | null; data?: any }> {
  const supabase = createClient()

  // Validate data with Zod schema
  const validationResult = customerFormSchema.safeParse(data)
  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error.flatten().fieldErrors)
    return {
      success: false,
      error: "Invalid data provided. Please check the form fields.",
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
  originalCustomerId: string, // The original ID of the customer to update
  data: CustomerFormValues,
): Promise<{ success: boolean; error?: string | null; data?: any }> {
  const supabase = createClient()

  if (!originalCustomerId) {
    return {
      success: false,
      error: "Orijinal müşteri ID bulunamadı",
    }
  }

  // Validate data - but we'll handle mid separately
  const validationResult = customerFormSchema.safeParse(data)
  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error.flatten().fieldErrors)
    return {
      success: false,
      error: "Geçersiz veri. Lütfen form alanlarını kontrol edin.",
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
