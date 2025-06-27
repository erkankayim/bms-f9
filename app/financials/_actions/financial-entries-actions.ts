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
  id: string
  contact_name: string | null
  email: string | null
}

export type SupplierForDropdown = {
  id: string
  name: string
  contact_name: string | null
}

export type IncomeEntryWithDetails = {
  id: number
  description: string
  incoming_amount: number
  entry_date: string
  source: string
  invoice_number: string | null
  payment_method: string
  notes: string | null
  customer_id: string | null
  category_id: number
  customer_name: string | null
  category_name: string | null
  customer_mid: string | null
  created_at: string
}

export type ExpenseEntry = {
  id: number
  description: string
  expense_amount: number
  payment_amount: number
  expense_title: string
  expense_source: string
  entry_date: string
  invoice_number?: string
  payment_method: string
  receipt_url?: string
  notes?: string
  supplier_id?: string
  supplier_name?: string
  category_name?: string
  created_at: string
}

// Data fetching functions
export async function getFinancialCategories(
  type: "income" | "expense",
): Promise<{ data?: FinancialCategory[]; error?: string }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("financial_categories")
    .select("id, name, type, description")
    .eq("type", type)
    .order("name")

  if (error) {
    console.error(`Error fetching financial categories (${type}):`, error.message)
    return { error: `Finansal kategoriler alınamadı: ${error.message}` }
  }
  return { data: data as FinancialCategory[] }
}

export async function getCustomersForDropdown(): Promise<{ data?: CustomerForDropdown[]; error?: string }> {
  const supabase = createClient()
  console.log("Fetching customers with service role...")
  const { data, error } = await supabase
    .from("customers")
    .select("id, mid, contact_name, email")
    .is("deleted_at", null)
    .order("contact_name")

  if (error) {
    console.error("Error fetching customers:", error.message)
    return { error: `Müşteriler alınamadı: ${error.message}` }
  }

  console.log(`Successfully fetched ${data.length} customers.`)
  return { data: data as CustomerForDropdown[] }
}

export async function getSuppliersForDropdown(): Promise<{ data?: SupplierForDropdown[]; error?: string }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, contact_name")
    .is("deleted_at", null)
    .order("name")

  if (error) {
    console.error("Error fetching suppliers:", error.message)
    return { error: `Tedarikçiler alınamadı: ${error.message}` }
  }
  return { data: data as SupplierForDropdown[] }
}

export async function getIncomeEntries(): Promise<{ data?: IncomeEntryWithDetails[]; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("income_entries")
    .select(`
      id,
      description,
      incoming_amount,
      entry_date,
      source,
      invoice_number,
      payment_method,
      notes,
      customer_id,
      category_id,
      created_at,
      customers(mid, contact_name),
      financial_categories(name)
    `)
    .order("entry_date", { ascending: false })

  if (error) {
    return { error: `Gelir kayıtları alınırken hata: ${error.message}` }
  }

  const formattedData =
    data?.map((entry: any) => ({
      id: entry.id,
      description: entry.description,
      incoming_amount: entry.incoming_amount,
      entry_date: entry.entry_date,
      source: entry.source,
      invoice_number: entry.invoice_number,
      payment_method: entry.payment_method,
      notes: entry.notes,
      customer_id: entry.customer_id,
      category_id: entry.category_id,
      customer_mid: entry.customers?.mid,
      customer_name: entry.customers?.contact_name,
      category_name: entry.financial_categories?.name,
      created_at: entry.created_at,
    })) || []

  return { data: formattedData }
}

export async function getIncomeEntryById(id: number): Promise<{ data?: IncomeEntryWithDetails; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("income_entries")
      .select(`
        id,
        description,
        incoming_amount,
        entry_date,
        source,
        invoice_number,
        payment_method,
        notes,
        customer_id,
        category_id,
        created_at,
        customers(mid, contact_name),
        financial_categories(name)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Database error for income entry ${id}:`, error)
      return { error: `Gelir kaydı alınırken hata: ${error.message}` }
    }

    const formattedData = {
      id: data.id,
      description: data.description,
      incoming_amount: data.incoming_amount,
      entry_date: data.entry_date,
      source: data.source,
      invoice_number: data.invoice_number,
      payment_method: data.payment_method,
      notes: data.notes,
      customer_id: data.customer_id,
      category_id: data.category_id,
      customer_mid: data.customers?.mid,
      customer_name: data.customers?.contact_name,
      category_name: data.financial_categories?.name,
      created_at: data.created_at,
    }

    return { data: formattedData }
  } catch (error) {
    console.error("Unexpected error fetching income entry:", error)
    return { error: `Gelir kaydı alınırken beklenmeyen hata: ${error}` }
  }
}

export async function getExpenseEntries(): Promise<{ data?: ExpenseEntry[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("expense_entries")
      .select(`
        id,
        description,
        expense_amount,
        payment_amount,
        expense_title,
        expense_source,
        entry_date,
        invoice_number,
        payment_method,
        receipt_url,
        notes,
        supplier_id,
        category_id,
        created_at,
        suppliers(name),
        financial_categories(name)
      `)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Database error for expense entries:", error)
      return { error: `Gider kayıtları alınırken hata: ${error.message}` }
    }

    const formattedData =
      data?.map((entry: any) => ({
        id: entry.id,
        description: entry.description,
        expense_amount: entry.expense_amount,
        payment_amount: entry.payment_amount,
        expense_title: entry.expense_title,
        expense_source: entry.expense_source,
        entry_date: entry.entry_date,
        invoice_number: entry.invoice_number,
        payment_method: entry.payment_method,
        receipt_url: entry.receipt_url,
        notes: entry.notes,
        supplier_id: entry.supplier_id,
        supplier_name: entry.suppliers?.name,
        category_name: entry.financial_categories?.name,
        created_at: entry.created_at,
      })) || []

    return { data: formattedData }
  } catch (error) {
    console.error("Unexpected error fetching expense entries:", error)
    return { error: `Gider kayıtları alınırken beklenmeyen hata: ${error}` }
  }
}

export async function getExpenseEntryById(id: number): Promise<{ data?: ExpenseEntry; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("expense_entries")
      .select(`
        id,
        description,
        expense_amount,
        payment_amount,
        expense_title,
        expense_source,
        entry_date,
        invoice_number,
        payment_method,
        receipt_url,
        notes,
        supplier_id,
        category_id,
        created_at,
        suppliers(name),
        financial_categories(name)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Database error for expense entry ${id}:`, error)
      return { error: `Gider kaydı alınırken hata: ${error.message}` }
    }

    const formattedData = {
      id: data.id,
      description: data.description,
      expense_amount: data.expense_amount,
      payment_amount: data.payment_amount,
      expense_title: data.expense_title,
      expense_source: data.expense_source,
      entry_date: data.entry_date,
      invoice_number: data.invoice_number,
      payment_method: data.payment_method,
      receipt_url: data.receipt_url,
      notes: data.notes,
      supplier_id: data.supplier_id,
      supplier_name: data.suppliers?.name,
      category_name: data.financial_categories?.name,
      created_at: data.created_at,
    }

    return { data: formattedData }
  } catch (error) {
    console.error("Unexpected error fetching expense entry:", error)
    return { error: `Gider kaydı alınırken beklenmeyen hata: ${error}` }
  }
}

export async function deleteIncomeEntry(id: number): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()

  const { error } = await supabase.from("income_entries").delete().eq("id", id)

  if (error) {
    return { success: false, message: `Gelir kaydı silinirken hata: ${error.message}` }
  }

  revalidatePath("/financials/income")
  return { success: true, message: "Gelir kaydı başarıyla silindi." }
}

export async function deleteExpenseEntry(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("expense_entries").delete().eq("id", id)

    if (error) {
      console.error(`Database error deleting expense entry ${id}:`, error)
      return { success: false, message: `Gider kaydı silinirken hata: ${error.message}` }
    }

    revalidatePath("/financials/expenses")
    return { success: true, message: "Gider kaydı başarıyla silindi." }
  } catch (error) {
    console.error("Unexpected error deleting expense entry:", error)
    return { success: false, message: `Gider kaydı silinirken beklenmeyen hata: ${error}` }
  }
}

// Helper function to get customer UUID from MID
async function getCustomerUUIDFromMID(supabase: any, mid: string): Promise<string | null> {
  const { data: customer, error } = await supabase.from("customers").select("id").eq("mid", mid).single()

  if (error || !customer) {
    console.error(`Customer with MID ${mid} not found.`, error)
    return null
  }
  return customer.id
}

// Server Actions
export async function createIncomeEntryAction(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const supabase = createClient()
  const rawData = Object.fromEntries(formData)

  const validatedFields = IncomeEntrySchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Lütfen hataları düzeltip tekrar deneyin.",
      errors: validatedFields.error.issues,
    }
  }

  const { customer_id: customerIdentifier, ...restOfData } = validatedFields.data

  let finalCustomerId: string | null = null
  if (customerIdentifier) {
    // Check if it's a MID (like CUST-001) or a UUID
    if (customerIdentifier.startsWith("CUST-")) {
      finalCustomerId = await getCustomerUUIDFromMID(supabase, customerIdentifier)
      if (!finalCustomerId) {
        return { success: false, message: `Seçilen müşteri (${customerIdentifier}) geçersiz.` }
      }
    } else {
      finalCustomerId = customerIdentifier // Assume it's a UUID
    }
  }

  const dataToUpsert = {
    ...restOfData,
    customer_id: finalCustomerId,
    amount: restOfData.incoming_amount,
  }

  const { error } = await supabase.from("income_entries").insert(dataToUpsert).select()

  if (error) {
    console.error("Income entry creation error:", error)
    return { success: false, message: `Kayıt sırasında hata: ${error.message}` }
  }

  revalidatePath("/financials/income")
  return { success: true, message: "Gelir kaydı başarıyla oluşturuldu." }
}

export async function updateIncomeEntryAction(
  id: number,
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  try {
    const supabase = createClient()
    const rawData = Object.fromEntries(formData)

    console.log("Raw update form data:", rawData)

    const validatedFields = IncomeEntrySchema.safeParse(rawData)

    if (!validatedFields.success) {
      console.log("Update validation errors:", validatedFields.error.issues)
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

    // If customer_id is provided and it's in MID format, convert to UUID
    let finalCustomerId: string | null = null
    if (customer_id) {
      if (customer_id.startsWith("CUST-")) {
        // It's a MID, convert to UUID
        finalCustomerId = await getCustomerUUIDFromMID(supabase, customer_id)
        if (!finalCustomerId) {
          return { success: false, message: `Seçilen müşteri (${customer_id}) bulunamadı.` }
        }
      } else {
        // It's already a UUID
        finalCustomerId = customer_id
      }
    }

    const { error } = await supabase
      .from("income_entries")
      .update({
        description,
        incoming_amount,
        entry_date,
        category_id,
        source,
        customer_id: finalCustomerId,
        invoice_number,
        payment_method,
        notes,
        amount: incoming_amount,
      })
      .eq("id", id)

    if (error) {
      console.error("Income entry update error:", error)
      return { success: false, message: `Gelir kaydı güncellenirken hata: ${error.message}` }
    }

    revalidatePath("/financials")
    revalidatePath("/financials/income")
    revalidatePath(`/financials/income/${id}`)
    return { success: true, message: "Gelir kaydı başarıyla güncellendi." }
  } catch (error) {
    console.error("Unexpected error updating income entry:", error)
    return { success: false, message: `Gelir kaydı güncellenirken beklenmeyen hata: ${error}` }
  }
}

export async function createExpenseEntryAction(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  try {
    const supabase = createClient()
    const rawData = Object.fromEntries(formData)

    console.log("Raw expense form data:", rawData)

    const validatedFields = ExpenseEntrySchema.safeParse(rawData)

    if (!validatedFields.success) {
      console.log("Expense validation errors:", validatedFields.error.issues)
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

    console.log("Validated expense data:", validatedFields.data)

    const { error } = await supabase.from("expense_entries").insert({
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
      amount: expense_amount,
    })

    if (error) {
      console.error("Expense entry creation error:", error)
      return { success: false, message: `Gider kaydı oluşturulurken hata: ${error.message}` }
    }

    revalidatePath("/financials")
    revalidatePath("/financials/expenses")
    return { success: true, message: "Gider kaydı başarıyla oluşturuldu." }
  } catch (error) {
    console.error("Unexpected error creating expense entry:", error)
    return { success: false, message: `Gider kaydı oluşturulurken beklenmeyen hata: ${error}` }
  }
}
