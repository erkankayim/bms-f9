"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Returns a list of expense entries with supplier & category information
 */
export async function getExpenseEntries() {
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
      created_at,
      suppliers!supplier_id (
        name
      ),
      financial_categories!category_id (
        name
      )
    `)
    .order("entry_date", { ascending: false })

  if (error) {
    console.error("[getExpenseEntries] DB error:", error)
    throw new Error("Gider kayıtları alınırken hata oluştu")
  }

  return (
    data?.map((entry) => ({
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
      created_at: entry.created_at,
      supplier_name: entry.suppliers?.name ?? null,
      category_name: entry.financial_categories?.name ?? null,
    })) ?? []
  )
}

/**
 * Fetch a single expense entry by id with its relations
 */
export async function getExpenseById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("expense_entries")
    .select(
      `
      *,
      suppliers!supplier_id (
        id,
        name,
        email,
        phone
      ),
      financial_categories!category_id (
        id,
        name
      )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("[getExpenseById] DB error:", error)
    throw new Error("Gider kaydı alınırken hata oluştu")
  }

  return {
    ...data,
    supplier: data.suppliers,
    category: data.financial_categories,
  }
}

/**
 * Create a new expense entry and redirect to its detail page
 */
export async function createExpense(formData: FormData) {
  const supabase = createClient()

  // Parse & transform incoming data
  const payload = {
    description: formData.get("description") as string,
    expense_amount: Number.parseFloat(formData.get("expense_amount") as string),
    payment_amount: Number.parseFloat(formData.get("payment_amount") as string),
    expense_title: formData.get("expense_title") as string,
    expense_source: formData.get("expense_source") as string,
    entry_date: formData.get("entry_date") as string,
    category_id: Number(formData.get("category_id")),
    supplier_id: (formData.get("supplier_id") as string) || null,
    invoice_number: (formData.get("invoice_number") as string) || null,
    payment_method: formData.get("payment_method") as string,
    notes: (formData.get("notes") as string) || null,
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("expense_entries").insert(payload).select("id").single()

  if (error) {
    console.error("[createExpense] DB error:", error)
    throw new Error("Gider eklenirken hata oluştu")
  }

  // Revalidate list and redirect
  revalidatePath("/financials/expenses")
  redirect(`/financials/expenses/${data.id}`)
}

/**
 * Update an existing expense entry
 */
export async function updateExpense(id: string, formData: FormData) {
  const supabase = createClient()

  const payload = {
    description: formData.get("description") as string,
    expense_amount: Number.parseFloat(formData.get("expense_amount") as string),
    payment_amount: Number.parseFloat(formData.get("payment_amount") as string),
    expense_title: formData.get("expense_title") as string,
    expense_source: formData.get("expense_source") as string,
    entry_date: formData.get("entry_date") as string,
    category_id: Number(formData.get("category_id")),
    supplier_id: (formData.get("supplier_id") as string) || null,
    invoice_number: (formData.get("invoice_number") as string) || null,
    payment_method: formData.get("payment_method") as string,
    notes: (formData.get("notes") as string) || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("expense_entries").update(payload).eq("id", id)

  if (error) {
    console.error("[updateExpense] DB error:", error)
    throw new Error("Gider güncellenirken hata oluştu")
  }

  revalidatePath("/financials/expenses")
  revalidatePath(`/financials/expenses/${id}`)
  redirect(`/financials/expenses/${id}`)
}

/**
 * Delete an expense entry
 */
export async function deleteExpense(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("expense_entries").delete().eq("id", id)

  if (error) {
    console.error("[deleteExpense] DB error:", error)
    throw new Error("Gider silinirken hata oluştu")
  }

  revalidatePath("/financials/expenses")
}

/**
 * Helper – list of financial categories (type === "expense")
 */
export async function getFinancialCategories() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("financial_categories")
    .select("id, name")
    .eq("type", "expense")
    .order("name")

  if (error) {
    console.error("[getFinancialCategories] DB error:", error)
    // Fallback to static defaults
    return [
      { id: 1, name: "Ofis Giderleri" },
      { id: 2, name: "Personel Giderleri" },
      { id: 3, name: "Pazarlama Giderleri" },
      { id: 4, name: "Diğer Giderler" },
    ]
  }

  return data ?? []
}

/**
 * Helper – list of suppliers
 */
export async function getSuppliers() {
  const supabase = createClient()

  const { data, error } = await supabase.from("suppliers").select("id, name").order("name")

  if (error) {
    console.error("[getSuppliers] DB error:", error)
    return []
  }

  return data ?? []
}
