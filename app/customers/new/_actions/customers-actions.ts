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
    .select() // Optionally select the inserted data if needed
    .single() // Expect a single record to be inserted

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
  revalidatePath(`/customers/${validationResult.data.mid}`) // Also revalidate detail page

  return { success: true, data: newCustomer }
}

// New function to update an existing customer
export async function updateCustomerAction(
  customerId: string, // The ID of the customer to update
  data: CustomerFormValues,
): Promise<{ success: boolean; error?: string | null; data?: any }> {
  const supabase = createClient()

  // Validate data - note: mid from form data is ignored for update key, customerId param is used
  const validationResult = customerFormSchema.safeParse(data)
  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error.flatten().fieldErrors)
    return {
      success: false,
      error: "Invalid data provided. Please check the form fields.",
    }
  }

  // Exclude 'mid' from the data to be updated as it's the primary key and shouldn't be changed.
  const { mid, ...updateData } = validationResult.data

  const { data: updatedCustomer, error } = await supabase
    .from("customers")
    .update(updateData)
    .eq("mid", customerId) // Use the customerId parameter to identify the record
    .select()
    .single()

  if (error) {
    console.error("Error updating customer:", error)
    return { success: false, error: error.message }
  }

  // Revalidate paths to ensure fresh data is shown
  revalidatePath("/customers") // For the list page
  revalidatePath(`/customers/${customerId}`) // For the detail page of this customer
  revalidatePath(`/customers/${customerId}/edit`) // For the edit page itself

  return { success: true, data: updatedCustomer }
}
