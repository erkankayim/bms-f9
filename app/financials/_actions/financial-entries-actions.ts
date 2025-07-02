"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import {
  ExpenseEntrySchema,
  IncomeEntrySchema,
  expenseCategories,
  incomeCategories,
} from "../_lib/financial-entry-shared"
import { z } from "zod"

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                    */
/* ------------------------------------------------------------------ */

export interface FinancialCategory {
  id: number
  name: string
  type: "income" | "expense"
  description?: string
}

export interface CustomerForDropdown {
  mid: string
  contact_name: string | null
  email: string | null
}

export interface SupplierForDropdown {
  id: string
  company_name: string
  contact_name: string | null
}

/**
 * When the database is unavailable we still return hard-coded defaults so that
 * the UI can render during development or with a fresh DB.
 */
const DEFAULT_INCOME_CATEGORIES: FinancialCategory[] = incomeCategories.map((c, i) => ({
  id: i + 1,
  name: c,
  type: "income",
}))
const DEFAULT_EXPENSE_CATEGORIES: FinancialCategory[] = expenseCategories.map((c, i) => ({
  id: i + 100,
  name: c,
  type: "expense",
}))

/* ------------------------------------------------------------------ */
/*  READ helpers (used in many pages)                                 */
/* ------------------------------------------------------------------ */

export async function getFinancialCategories(type: "income" | "expense") {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from<FinancialCategory>("financial_categories")
      .select("id,name,type,description")
      .eq("type", type)
      .order("name")

    if (error) {
      console.warn("[financial_categories] fallback to defaults –", error.message)
      return { data: type === "income" ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES }
    }
    return { data }
  } catch (err) {
    console.error("getFinancialCategories:", err)
    return { data: type === "income" ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES }
  }
}

export async function getCustomersForDropdown() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from<CustomerForDropdown>("customers")
      .select("mid,contact_name,email")
      .order("contact_name")

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: String(err) }
  }
}

export async function getSuppliersForDropdown() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from<SupplierForDropdown>("suppliers")
      .select("id,company_name,contact_name")
      .order("company_name")

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: String(err) }
  }
}

export async function getIncomeEntries() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("income_entries")
      .select(
        `id,description,amount:incoming_amount,category,entry_date,invoice_number,payment_method,notes,
         customers:customer_id(mid,contact_name)`,
      )
      .order("entry_date", { ascending: false })

    if (error) return { error: error.message }
    return { data }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function getIncomeEntryById(id: string | number) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("income_entries")
      .select(
        `id,description,amount:incoming_amount,category,entry_date,invoice_number,payment_method,notes,
         account_id,customers:customer_id(mid,contact_name)`,
      )
      .eq("id", id)
      .single()

    if (error) return { error: error.message }
    return { data }
  } catch (err) {
    return { error: String(err) }
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE helpers                                                    */
/* ------------------------------------------------------------------ */

export async function deleteIncomeEntry(id: number) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("income_entries").delete().eq("id", id)
    if (error) return { success: false, message: error.message }

    revalidatePath("/financials/income")
    return { success: true, message: "Silindi" }
  } catch (err) {
    return { success: false, message: String(err) }
  }
}

/* ------------------------------------------------------------------ */
/*  CREATE / UPDATE (already added)                                   */
/* ------------------------------------------------------------------ */

export async function createExpenseEntry(prev: any, formData: FormData) {
  try {
    const supabase = createClient()
    const raw = Object.fromEntries(formData)
    const parsed = ExpenseEntrySchema.parse(raw)

    const {
      data: { user },
      error: uErr,
    } = await supabase.auth.getUser()
    if (uErr || !user) return { success: false, message: "Auth error" }

    const { error } = await supabase.from("expense_entries").insert({
      ...parsed,
      amount: Number(parsed.amount),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) return { success: false, message: error.message }

    revalidatePath("/financials/expenses")
    return { success: true, message: "Kaydedildi" }
  } catch (err) {
    if (err instanceof z.ZodError) return { success: false, message: "Doğrulama hatası", errors: err.issues }
    return { success: false, message: String(err) }
  }
}

export async function updateExpenseEntry(id: string, prev: any, formData: FormData) {
  try {
    const supabase = createClient()
    const raw = Object.fromEntries(formData)
    const parsed = ExpenseEntrySchema.parse(raw)

    const {
      data: { user },
      error: uErr,
    } = await supabase.auth.getUser()
    if (uErr || !user) return { success: false, message: "Auth error" }

    const { error } = await supabase
      .from("expense_entries")
      .update({ ...parsed, amount: Number(parsed.amount), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) return { success: false, message: error.message }

    revalidatePath(`/financials/expenses/${id}`)
    revalidatePath("/financials/expenses")
    return { success: true, message: "Güncellendi" }
  } catch (err) {
    if (err instanceof z.ZodError) return { success: false, message: "Doğrulama hatası", errors: err.issues }
    return { success: false, message: String(err) }
  }
}

export async function createIncomeEntry(prev: any, formData: FormData) {
  try {
    const supabase = createClient()
    const raw = Object.fromEntries(formData)
    const parsed = IncomeEntrySchema.parse(raw)

    const {
      data: { user },
      error: uErr,
    } = await supabase.auth.getUser()
    if (uErr || !user) return { success: false, message: "Auth error" }

    const { error } = await supabase.from("income_entries").insert({
      ...parsed,
      amount: Number(parsed.amount),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) return { success: false, message: error.message }

    revalidatePath("/financials/income")
    return { success: true, message: "Kaydedildi" }
  } catch (err) {
    if (err instanceof z.ZodError) return { success: false, message: "Doğrulama hatası", errors: err.issues }
    return { success: false, message: String(err) }
  }
}

export async function updateIncomeEntry(id: string, prev: any, formData: FormData) {
  try {
    const supabase = createClient()
    const raw = Object.fromEntries(formData)
    const parsed = IncomeEntrySchema.parse(raw)

    const {
      data: { user },
      error: uErr,
    } = await supabase.auth.getUser()
    if (uErr || !user) return { success: false, message: "Auth error" }

    const { error } = await supabase
      .from("income_entries")
      .update({ ...parsed, amount: Number(parsed.amount), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) return { success: false, message: error.message }

    revalidatePath(`/financials/income/${id}`)
    revalidatePath("/financials/income")
    return { success: true, message: "Güncellendi" }
  } catch (err) {
    if (err instanceof z.ZodError) return { success: false, message: "Doğrulama hatası", errors: err.issues }
    return { success: false, message: String(err) }
  }
}

/* ------------------------------------------------------------------ */
/*  Legacy aliases so older imports keep working                      */
/* ------------------------------------------------------------------ */

export const createExpenseEntryAction = createExpenseEntry
export const updateExpenseEntryAction = updateExpenseEntry
export const createIncomeEntryAction = createIncomeEntry
export const updateIncomeEntryAction = updateIncomeEntry

/* READ aliases */
export const getIncomeEntriesAction = getIncomeEntries
export const getIncomeEntryByIdAction = getIncomeEntryById

/* DELETE aliases */
export const deleteIncomeEntryAction = deleteIncomeEntry
