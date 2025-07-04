"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { redirect } from "next/navigation"

// Schema for income entry
const incomeEntrySchema = z.object({
  incoming_amount: z.coerce
    .number({ required_error: "Gelen tutar zorunludur." })
    .positive("Gelen tutar pozitif olmalıdır."),
  entry_date: z.string().min(1, "Tarih gereklidir."),
  category_id: z.coerce.number().int().positive("Kategori seçimi gereklidir."),
  customer_id: z.string().optional().nullable(),
  source: z.string().min(1, "Gelir kaynağı gereklidir."),
  description: z.string().min(1, "Açıklama gereklidir."),
  invoice_number: z.string().optional().nullable(),
  payment_method: z.string().min(1, "Ödeme şekli gereklidir."),
  notes: z.string().optional().nullable(),
})

// Get all income entries
export async function getIncomeEntries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("income_entries")
    .select(`*, financial_categories(name), customers(contact_name)`)
    .order("entry_date", { ascending: false })

  if (error) {
    console.error("Error fetching income entries:", error)
    throw new Error("Gelir kayıtları alınamadı.")
  }
  return data
}

// Create income entry action
export async function createIncomeEntryAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  const rawData = Object.fromEntries(formData.entries())
  if (rawData.customer_id === "no-customer") {
    rawData.customer_id = ""
  }

  const validatedFields = incomeEntrySchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Form verileri geçersiz. Lütfen hataları düzeltip tekrar deneyin.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase.from("income_entries").insert(validatedFields.data)

  if (error) {
    return { success: false, message: `Veritabanı hatası: ${error.message}`, errors: null }
  }

  revalidatePath("/financials/income")
  redirect("/financials/income")
}

// Delete income entry
export async function deleteIncome(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("income_entries").delete().eq("id", id)
  if (error) {
    throw new Error("Gelir kaydı silinemedi")
  }
  revalidatePath("/financials/income")
}

// Get customers for dropdown
export async function getCustomersForDropdown() {
  const supabase = createClient()
  const { data, error } = await supabase.from("customers").select("mid, contact_name, email").order("contact_name")
  if (error) return { data: null, error: "Müşteriler yüklenemedi." }
  return { data, error: null }
}

// Get financial categories for income
export async function getFinancialCategories(type: "income" | "expense") {
  const supabase = createClient()
  const { data, error } = await supabase.from("financial_categories").select("*").eq("type", type).order("name")
  if (error) return { data: null, error: "Kategoriler yüklenemedi." }
  return { data, error: null }
}
