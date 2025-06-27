"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { IncomeEntrySchema, ExpenseEntrySchema } from "../_lib/financial-entry-shared"
import type { z } from "zod"

// Types
export type FinancialCategory = {
  id: number
  name: string
  type: "income" | "expense"
  description?: string
}

export type CustomerForDropdown = {
  mid: string
  contact_name: string | null
  email: string | null
}

export type SupplierForDropdown = {
  id: string
  name: string
  contact_name: string | null
}

// Data fetching functions
export async function getFinancialCategories(
  type: "income" | "expense",
): Promise<{ data?: FinancialCategory[]; error?: string }> {
  const supabase = createClient()

  // First, check if financial_categories table exists and what columns it has
  const { data: tableInfo, error: tableError } = await supabase.from("financial_categories").select("*").limit(1)

  if (tableError) {
    // If table doesn't exist, create default categories
    console.error("Financial categories table error:", tableError)

    // Return default categories based on type
    const defaultIncomeCategories = [
      {
        id: 1,
        name: "Ürün Satışları",
        type: "income" as const,
        description: "Ürün satışlarından elde edilen gelirler",
      },
      {
        id: 2,
        name: "Hizmet Gelirleri",
        type: "income" as const,
        description: "Sunulan hizmetlerden elde edilen gelirler",
      },
      { id: 3, name: "Faiz Gelirleri", type: "income" as const, description: "Banka faizleri ve yatırım gelirleri" },
      { id: 4, name: "Diğer Gelirler", type: "income" as const, description: "Diğer çeşitli gelir kaynakları" },
    ]

    const defaultExpenseCategories = [
      {
        id: 5,
        name: "Ofis Giderleri",
        type: "expense" as const,
        description: "Ofis kirası, elektrik, su, internet vb.",
      },
      {
        id: 6,
        name: "Personel Giderleri",
        type: "expense" as const,
        description: "Maaş, SGK, vergi vb. personel maliyetleri",
      },
      { id: 7, name: "Malzeme Giderleri", type: "expense" as const, description: "Hammadde ve malzeme alımları" },
      {
        id: 8,
        name: "Pazarlama Giderleri",
        type: "expense" as const,
        description: "Reklam, tanıtım ve pazarlama faaliyetleri",
      },
      { id: 9, name: "Diğer Giderler", type: "expense" as const, description: "Diğer çeşitli gider kalemleri" },
    ]

    const defaultCategories = type === "income" ? defaultIncomeCategories : defaultExpenseCategories
    return { data: defaultCategories }
  }

  // Try to select with is_active column first
  let { data, error } = await supabase
    .from("financial_categories")
    .select("id, name, type, description, is_active")
    .eq("type", type)
    .eq("is_active", true)
    .order("name")

  // If is_active column doesn't exist, try without it
  if (error && error.message.includes("is_active")) {
    const { data: dataWithoutActive, error: errorWithoutActive } = await supabase
      .from("financial_categories")
      .select("id, name, type, description")
      .eq("type", type)
      .order("name")

    if (errorWithoutActive) {
      return { error: `Finansal kategoriler alınırken hata: ${errorWithoutActive.message}` }
    }

    // Add is_active: true to all records for compatibility
    data = dataWithoutActive?.map((cat) => ({ ...cat, is_active: true })) || []
  } else if (error) {
    return { error: `Finansal kategoriler alınırken hata: ${error.message}` }
  }

  return { data: data as FinancialCategory[] }
}

export async function getCustomersForDropdown(): Promise<{ data?: CustomerForDropdown[]; error?: string }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("mid, contact_name, email")
    .is("deleted_at", null)
    .order("contact_name")

  if (error) {
    return { error: `Müşteriler alınırken hata: ${error.message}` }
  }
  return { data }
}

export async function getSuppliersForDropdown(): Promise<{ data?: SupplierForDropdown[]; error?: string }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, contact_name")
    .is("deleted_at", null)
    .order("name")

  if (error) {
    return { error: `Tedarikçiler alınırken hata: ${error.message}` }
  }
  return { data }
}

// Server Actions
export async function createIncomeEntryAction(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const supabase = createClient()
  const rawData = Object.fromEntries(formData)

  // Handle optional customer_id
  if (rawData.customer_id === "none" || rawData.customer_id === "" || !rawData.customer_id) {
    rawData.customer_id = null
  }

  // Handle optional fields
  if (!rawData.invoice_number || rawData.invoice_number === "") {
    rawData.invoice_number = null
  }

  if (!rawData.notes || rawData.notes === "") {
    rawData.notes = null
  }

  if (rawData.category_id && typeof rawData.category_id === "string") {
    rawData.category_id = Number.parseInt(rawData.category_id as string, 10)
  }

  const validatedFields = IncomeEntrySchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Lütfen aşağıdaki hataları düzeltin ve tekrar deneyin.",
      errors: validatedFields.error.issues,
    }
  }

  const {
    description,
    incoming_amount,
    entry_date,
    category_id,
    source,
    customer_id,
    invoice_number,
    payment_method,
    notes,
  } = validatedFields.data

  const { error } = await supabase.from("income_entries").insert({
    description,
    incoming_amount,
    entry_date,
    category_id,
    source,
    customer_id: customer_id || null,
    invoice_number: invoice_number || null,
    payment_method,
    notes: notes || null,
    amount: incoming_amount,
  })

  if (error) {
    console.error("Income entry creation error:", error)
    return { success: false, message: `Gelir kaydı oluşturulurken hata: ${error.message}` }
  }

  revalidatePath("/financials")
  revalidatePath("/financials/income")
  return { success: true, message: "Gelir kaydı başarıyla oluşturuldu." }
}

export async function createExpenseEntryAction(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const supabase = createClient()
  const rawData = Object.fromEntries(formData)

  // Handle optional supplier_id
  if (rawData.supplier_id === "none" || rawData.supplier_id === "" || !rawData.supplier_id) {
    rawData.supplier_id = null
  }

  // Handle optional fields
  if (!rawData.invoice_number || rawData.invoice_number === "") {
    rawData.invoice_number = null
  }

  if (!rawData.receipt_url || rawData.receipt_url === "") {
    rawData.receipt_url = null
  }

  if (!rawData.notes || rawData.notes === "") {
    rawData.notes = null
  }

  if (rawData.category_id && typeof rawData.category_id === "string") {
    rawData.category_id = Number.parseInt(rawData.category_id as string, 10)
  }

  const validatedFields = ExpenseEntrySchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Lütfen aşağıdaki hataları düzeltin ve tekrar deneyin.",
      errors: validatedFields.error.issues,
    }
  }

  const {
    description,
    expense_amount,
    payment_amount,
    expense_title,
    expense_source,
    entry_date,
    category_id,
    supplier_id,
    invoice_number,
    payment_method,
    receipt_url,
    notes,
  } = validatedFields.data

  const { error } = await supabase.from("expense_entries").insert({
    description,
    expense_amount,
    payment_amount,
    expense_title,
    expense_source,
    entry_date,
    category_id,
    supplier_id: supplier_id || null,
    invoice_number: invoice_number || null,
    payment_method,
    receipt_url: receipt_url || null,
    notes: notes || null,
    amount: expense_amount,
  })

  if (error) {
    console.error("Expense entry creation error:", error)
    return { success: false, message: `Gider kaydı oluşturulurken hata: ${error.message}` }
  }

  revalidatePath("/financials")
  revalidatePath("/financials/expenses")
  return { success: true, message: "Gider kaydı başarıyla oluşturuldu." }
}
