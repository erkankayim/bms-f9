"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const supabase = () => createClient()

/* ────────────────────────────────────────────────────────────────────────── *
 *  TYPES
 * ────────────────────────────────────────────────────────────────────────── */
export interface ExpensePayload {
  expense_title: string
  description?: string | null
  expense_amount: number
  payment_amount?: number
  expense_source?: string | null
  payment_method?: string | null
  entry_date: string
  category_id?: number | null
  supplier_id?: number | null
  invoice_number?: string | null
  receipt_url?: string | null
  notes?: string | null
}

/* ────────────────────────────────────────────────────────────────────────── *
 *  READ
 * ────────────────────────────────────────────────────────────────────────── */
export async function getExpenseById(id: string | number) {
  const { data, error } = await supabase()
    .from("expense_entries")
    .select(
      `
      *,
      category:financial_categories(id,name),
      supplier:suppliers(id,name,email,phone)
    `,
    )
    .eq("id", id)
    .single()

  return { data, error }
}

/* ────────────────────────────────────────────────────────────────────────── *
 *  UPDATE
 * ────────────────────────────────────────────────────────────────────────── */
export async function updateExpense(id: string | number, payload: ExpensePayload) {
  const { error } = await supabase().from("expense_entries").update(payload).eq("id", id)

  if (error) {
    return { error }
  }

  /* Refresh both the list and detail pages */
  revalidatePath("/financials/expenses")
  revalidatePath(`/financials/expenses/${id}`)

  return { success: true }
}

/* ────────────────────────────────────────────────────────────────────────── *
 *  DELETE
 * ────────────────────────────────────────────────────────────────────────── */
export async function deleteExpense(id: string | number) {
  const { error } = await supabase().from("expense_entries").delete().eq("id", id)

  if (error) {
    return { error }
  }

  revalidatePath("/financials/expenses")
  return { success: true }
}
