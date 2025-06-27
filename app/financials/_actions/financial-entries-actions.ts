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

export type IncomeEntry = {
  id: number
  description: string
  incoming_amount: number
  entry_date: string
  source: string
  invoice_number?: string
  payment_method: string
  notes?: string
  customer_mid?: string
  customer_name?: string
  category_name?: string
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
      { id: 12, name: "Danışmanlık Geliri", type: "income" as const, description: "Sağlanan danışmanlık hizmetlerinden elde edilen gelir" },
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

export async function getIncomeEntries(): Promise<{ data?: IncomeEntry[]; error?: string }> {
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
      customers!inner(mid, contact_name),
      financial_categories(name)
    `)
    .order("entry_date", { ascending: false })

  if (error) {
    return { error: `Gelir kayıtları alınırken hata: ${error.message}` }
  }

  const formattedData = data?.map((entry: any) => ({
    id: entry.id,
    description: entry.description,
    incoming_amount: entry.incoming_amount,
    entry_date: entry.entry_date,
    source: entry.source,
    invoice_number: entry.invoice_number,
    payment_method: entry.payment_method,
    notes: entry.notes,
    customer_mid: entry.customers?.mid,
    customer_name: entry.customers?.contact_name,
    category_name: entry.financial_categories?.name,
    created_at: entry.created_at,
  })) || []

  return { data: formattedData }
}

export async function getExpenseEntries(): Promise<{ data?: ExpenseEntry[]; error?: string }> {
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
    return { error: `Gider kayıtları alınırken hata: ${error.message}` }
  }

  const formattedData = data?.map((entry: any) => ({
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
}

export async function getIncomeEntryById(id: number): Promise<{ data?: IncomeEntry; error?: string }> {
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
    customer_mid: data.customers?.mid,
    customer_name: data.customers?.contact_name,
    category_name: data.financial_categories?.name,
    created_at: data.created_at,
  }

  return { data: formattedData }
}

export async function getExpenseEntryById(id: number): Promise<{ data?: ExpenseEntry; error?: string }> {
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
}

export async function deleteIncomeEntry(id: number): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("income_entries")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, message: `Gelir kaydı silinirken hata: ${error.message}` }
  }

  revalidatePath("/financials/income")
  return { success: true, message: "Gelir kaydı başarıyla silindi." }
}

export async function deleteExpenseEntry(id: number): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("expense_entries")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, message: `Gider kaydı silinirken hata: ${error.message}` }
  }

  revalidatePath("/financials/expenses")
  return { success: true, message: "Gider kaydı başarıyla silindi." }
}

// Server Actions
export async function createIncomeEntryAction(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const supabase = createClient()
  const rawData = Object.fromEntries(formData)

  console.log("Raw form data:", rawData)

  const validatedFields = IncomeEntrySchema.safeParse(rawData)

  if (!validatedFields.success) {
    console.log("Validation errors:", validatedFields.error.issues)
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

  console.log("Validated data:", validatedFields.data)

  // customer_id is MID format, we need to store it as is
  const { error } = await supabase.from("income_entries").insert({
    description,
    incoming_amount,
    entry_date,
    category_id,
    source,
    customer_id, // This will be MID format like "CUST-004"
    invoice_number,
    payment_method,
    notes,
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
}
