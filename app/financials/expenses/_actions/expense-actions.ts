"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/* ----------------------------------------------------------------
 * Türler
 * ----------------------------------------------------------------*/
interface ExpenseEntry {
  id: string
  entry_date: string
  expense_title: string
  expense_source: string
  expense_amount: number
  payment_amount: number
  description: string
  invoice_number?: string | null
  payment_method: string
  notes?: string | null
  created_at?: string
  financial_categories?: { name: string }
  suppliers?: { name: string; email?: string | null; phone?: string | null }
}

/* ----------------------------------------------------------------
 * Listeleme
 * ----------------------------------------------------------------*/
export async function getExpenseEntries(): Promise<ExpenseEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("expense_entries")
    .select(
      `
        id,
        entry_date,
        expense_title,
        expense_source,
        expense_amount,
        payment_amount,
        description,
        invoice_number,
        payment_method,
        notes,
        created_at,
        financial_categories ( name ),
        suppliers ( name, email, phone )
      `,
    )
    .order("entry_date", { ascending: false })

  if (error) {
    console.error("[getExpenseEntries] DB error:", error)
    return []
  }
  return (data as ExpenseEntry[]) ?? []
}

/* ----------------------------------------------------------------
 * Tekil kayıt
 * ----------------------------------------------------------------*/
export async function getExpenseById(id: string): Promise<ExpenseEntry | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("expense_entries")
    .select(
      `
        id,
        entry_date,
        expense_title,
        expense_source,
        expense_amount,
        payment_amount,
        description,
        invoice_number,
        payment_method,
        notes,
        created_at,
        financial_categories ( name ),
        suppliers ( name, email, phone )
      `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("[getExpenseById] DB error:", error)
    return null
  }
  return data as ExpenseEntry
}

/* ----------------------------------------------------------------
 * Silme
 * ----------------------------------------------------------------*/
export async function deleteExpense(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("expense_entries").delete().eq("id", id)
  if (error) {
    console.error("[deleteExpense] DB error:", error)
    throw new Error("Gider silinirken hata oluştu")
  }
  revalidatePath("/financials/expenses")
}

/* ----------------------------------------------------------------
 * Dropdown yardımcıları
 * ----------------------------------------------------------------*/
export async function getFinancialCategories(type: "expense" | "income") {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("financial_categories")
    .select("id,name")
    .eq("category_type", type)
    .order("name", { ascending: true })

  if (error) {
    console.error("[getFinancialCategories] DB error:", error)
    return { data: null, error: "Kategoriler yüklenemedi" }
  }
  return { data, error: null }
}

export async function getSuppliersForDropdown() {
  const supabase = createClient()
  const { data, error } = await supabase.from("suppliers").select("id,name").order("name")
  if (error) {
    console.error("[getSuppliersForDropdown] DB error:", error)
    return { data: null, error: "Tedarikçiler yüklenemedi" }
  }
  return { data, error: null }
}

/* ----------------------------------------------------------------
 * Oluşturma – useActionState uyumlu
 * ----------------------------------------------------------------*/
interface CreateExpenseState {
  success: boolean
  message: string
  errors: Record<string, string[]> | null
}

export async function createExpenseEntryAction(
  _prev: CreateExpenseState,
  formData: FormData,
): Promise<CreateExpenseState> {
  const supabase = createClient()

  const payload = {
    entry_date: formData.get("entry_date"),
    category_id: formData.get("category_id") || null,
    supplier_id: formData.get("supplier_id") === "no-supplier" ? null : formData.get("supplier_id"),
    expense_amount: Number(formData.get("expense_amount") || 0),
    payment_amount: Number(formData.get("payment_amount") || 0),
    expense_title: formData.get("expense_title"),
    expense_source: formData.get("expense_source"),
    description: formData.get("description"),
    invoice_number: formData.get("invoice_number") || null,
    payment_method: formData.get("payment_method"),
    notes: formData.get("notes") || null,
  }

  // Basit doğrulama
  if (!payload.expense_title || !payload.expense_amount || !payload.entry_date) {
    return { success: false, message: "Zorunlu alanları doldurunuz", errors: null }
  }

  const { error } = await supabase.from("expense_entries").insert(payload)
  if (error) {
    console.error("[createExpenseEntryAction] DB error:", error)
    return { success: false, message: "Gider kaydı oluşturulamadı", errors: null }
  }

  revalidatePath("/financials/expenses")
  redirect("/financials/expenses")
}
