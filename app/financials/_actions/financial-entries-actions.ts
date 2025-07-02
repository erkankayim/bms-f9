"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ExpenseEntrySchema, IncomeEntrySchema } from "../_lib/financial-entry-shared"

// Create expense entry
export async function createExpenseEntry(formData: FormData) {
  try {
    const supabase = await createClient()

    const rawData = {
      description: formData.get("description") as string,
      expense_amount: Number.parseFloat(formData.get("expense_amount") as string),
      entry_date: formData.get("entry_date") as string,
      payment_method: formData.get("payment_method") as string,
      category: formData.get("category") as string,
      supplier_id: formData.get("supplier_id") ? Number.parseInt(formData.get("supplier_id") as string) : null,
      notes: (formData.get("notes") as string) || null,
    }

    const validatedData = ExpenseEntrySchema.parse(rawData)

    const { data, error } = await supabase.from("expense_entries").insert([validatedData]).select().single()

    if (error) {
      console.error("Database error:", error)
      return { error: "Gider kaydı oluşturulurken hata oluştu" }
    }

    revalidatePath("/financials/expenses")
    return { success: true, data }
  } catch (error) {
    console.error("Create expense error:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Update expense entry
export async function updateExpenseEntry(id: number, formData: FormData) {
  try {
    const supabase = await createClient()

    const rawData = {
      description: formData.get("description") as string,
      expense_amount: Number.parseFloat(formData.get("expense_amount") as string),
      entry_date: formData.get("entry_date") as string,
      payment_method: formData.get("payment_method") as string,
      category: formData.get("category") as string,
      supplier_id: formData.get("supplier_id") ? Number.parseInt(formData.get("supplier_id") as string) : null,
      notes: (formData.get("notes") as string) || null,
    }

    const validatedData = ExpenseEntrySchema.parse(rawData)

    const { data, error } = await supabase.from("expense_entries").update(validatedData).eq("id", id).select().single()

    if (error) {
      console.error("Database error:", error)
      return { error: "Gider kaydı güncellenirken hata oluştu" }
    }

    revalidatePath("/financials/expenses")
    revalidatePath(`/financials/expenses/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Update expense error:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Get expense entries
export async function getExpenseEntries() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("expense_entries")
      .select(`
        *,
        suppliers (
          company_name
        )
      `)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return { error: "Gider kayıtları yüklenirken hata oluştu" }
    }

    return { data: data || [] }
  } catch (error) {
    console.error("Get expenses error:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Get expense entry by ID
export async function getExpenseEntryById(id: number) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("expense_entries")
      .select(`
        *,
        suppliers (
          id,
          company_name
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Database error:", error)
      return { error: "Gider kaydı bulunamadı" }
    }

    return { data }
  } catch (error) {
    console.error("Get expense by ID error:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Delete expense entry
export async function deleteExpenseEntry(id: number) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("expense_entries").delete().eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return { error: "Gider kaydı silinirken hata oluştu" }
    }

    revalidatePath("/financials/expenses")
    return { success: true }
  } catch (error) {
    console.error("Delete expense error:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Create income entry
export async function createIncomeEntry(formData: FormData) {
  try {
    const supabase = await createClient()

    const rawData = {
      description: formData.get("description") as string,
      incoming_amount: Number.parseFloat(formData.get("incoming_amount") as string),
      entry_date: formData.get("entry_date") as string,
      payment_method: formData.get("payment_method") as string,
      category: formData.get("category") as string,
      customer_id: formData.get("customer_id") ? Number.parseInt(formData.get("customer_id") as string) : null,
      notes: (formData.get("notes") as string) || null,
    }

    const validatedData = IncomeEntrySchema.parse(rawData)

    const { data, error } = await supabase.from("income_entries").insert([validatedData]).select().single()

    if (error) {
      console.error("Database error:", error)
      return { error: "Gelir kaydı oluşturulurken hata oluştu" }
    }

    revalidatePath("/financials/income")
    return { success: true, data }
  } catch (error) {
    console.error("Create income error:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Update income entry
export async function updateIncomeEntry(id: number, formData: FormData) {
  try {
    const supabase = await createClient()

    const rawData = {
      description: formData.get("description") as string,
      incoming_amount: Number.parseFloat(formData.get("incoming_amount") as string),
      entry_date: formData.get("entry_date") as string,
      payment_method: formData.get("payment_method") as string,
      category: formData.get("category") as string,
      customer_id: formData.get("customer_id") ? Number.parseInt(formData.get("customer_id") as string) : null,
      notes: (formData.get("notes") as string) || null,
    }

    const validatedData = IncomeEntrySchema.parse(rawData)

    const { data, error } = await supabase.from("income_entries").update(validatedData).eq("id", id).select().single()

    if (error) {
      console.error("Database error:", error)
      return { error: "Gelir kaydı güncellenirken hata oluştu" }
    }

    revalidatePath("/financials/income")
    revalidatePath(`/financials/income/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Update income error:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Get income entries
export async function getIncomeEntries() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("income_entries")
      .select(`
        *,
        customers (
          first_name,
          last_name,
          company_name
        )
      `)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return { error: "Gelir kayıtları yüklenirken hata oluştu" }
    }

    return { data: data || [] }
  } catch (error) {
    console.error("Get income entries error:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Get income entry by ID
export async function getIncomeEntryById(id: number) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("income_entries")
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          company_name
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Database error:", error)
      return { error: "Gelir kaydı bulunamadı" }
    }

    return { data }
  } catch (error) {
    console.error("Get income by ID error:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Delete income entry
export async function deleteIncomeEntry(id: number) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("income_entries").delete().eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return { error: "Gelir kaydı silinirken hata oluştu" }
    }

    revalidatePath("/financials/income")
    return { success: true }
  } catch (error) {
    console.error("Delete income error:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Helper functions for dropdowns
export async function getFinancialCategories() {
  return [
    "Satış Geliri",
    "Hizmet Geliri",
    "Faiz Geliri",
    "Kira Geliri",
    "Diğer Gelirler",
    "Ofis Giderleri",
    "Pazarlama Giderleri",
    "Personel Giderleri",
    "Kira Giderleri",
    "Diğer Giderler",
  ]
}

export async function getCustomersForDropdown() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("customers")
      .select("id, first_name, last_name, company_name")
      .order("first_name")

    if (error) {
      console.error("Database error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Get customers error:", error)
    return []
  }
}

export async function getSuppliersForDropdown() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("suppliers").select("id, company_name").order("company_name")

    if (error) {
      console.error("Database error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Get suppliers error:", error)
    return []
  }
}

// Legacy aliases for backward compatibility
export const createIncomeEntryAction = createIncomeEntry
export const updateIncomeEntryAction = updateIncomeEntry
export const createExpenseEntryAction = createExpenseEntry
export const updateExpenseEntryAction = updateExpenseEntry
