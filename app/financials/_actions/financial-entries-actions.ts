"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Helper - get account categories (income / expense)
export async function getFinancialCategories(type: "income" | "expense" = "income") {
  const supabase = createClient()

  try {
    // chart_of_accounts - (id, name, type) structure is expected
    const { data, error } = await supabase
      .from("chart_of_accounts")
      .select("id, name, type, description")
      .eq("type", type)
      .order("name")

    if (error) {
      console.error("getFinancialCategories ➜ Supabase error:", error)
      return { error: "Kategoriler getirilemedi" } as const
    }

    return { data } as const
  } catch (err) {
    console.error("getFinancialCategories ➜ Unexpected error:", err)
    return { error: "Beklenmeyen bir hata oluştu" } as const
  }
}

export type IncomeEntry = {
  id: string
  amount: number
  description: string
  date: string
  customer_id: string | null
  category: string
  created_at: string
  customer?: {
    company_name: string
  }
}

export type ExpenseEntry = {
  id: string
  amount: number
  description: string
  date: string
  supplier_id: string | null
  category: string
  created_at: string
  supplier?: {
    company_name: string
  }
}

export type Customer = {
  mid: string
  company_name: string
}

export type Supplier = {
  id: string
  company_name: string
}

export async function getIncomeEntries(): Promise<IncomeEntry[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("income_entries")
      .select(`
        id,
        amount,
        description,
        date,
        customer_id,
        category,
        created_at,
        customers (
          company_name
        )
      `)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching income entries:", error)
      return []
    }

    return (
      data?.map((entry) => ({
        ...entry,
        customer: entry.customers ? { company_name: entry.customers.company_name } : undefined,
      })) || []
    )
  } catch (error) {
    console.error("Unexpected error fetching income entries:", error)
    return []
  }
}

export async function getExpenseEntries(): Promise<ExpenseEntry[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("expense_entries")
      .select(`
        id,
        amount,
        description,
        date,
        supplier_id,
        category,
        created_at,
        suppliers (
          company_name
        )
      `)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching expense entries:", error)
      return []
    }

    return (
      data?.map((entry) => ({
        ...entry,
        supplier: entry.suppliers ? { company_name: entry.suppliers.company_name } : undefined,
      })) || []
    )
  } catch (error) {
    console.error("Unexpected error fetching expense entries:", error)
    return []
  }
}

export async function getCustomersForDropdown(): Promise<Customer[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("customers").select("mid, company_name").order("company_name")

    if (error) {
      console.error("Error fetching customers:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching customers:", error)
    return []
  }
}

export async function getSuppliersForDropdown(): Promise<Supplier[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("suppliers").select("id, company_name").order("company_name")

    if (error) {
      console.error("Error fetching suppliers:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching suppliers:", error)
    return []
  }
}

export async function createIncomeEntryAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const customer_id = (formData.get("customer_id") as string) || null
    const category = formData.get("category") as string

    if (!amount || !description || !date || !category) {
      return { error: "Tüm gerekli alanları doldurun" }
    }

    const { error } = await supabase.from("income_entries").insert({
      amount,
      description,
      date,
      customer_id: customer_id === "" ? null : customer_id,
      category,
    })

    if (error) {
      console.error("Error creating income entry:", error)
      return { error: "Gelir kaydı oluşturulurken hata oluştu" }
    }

    revalidatePath("/financials/income")
    return { success: true, message: "Gelir kaydı başarıyla oluşturuldu" }
  } catch (error) {
    console.error("Unexpected error creating income entry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function createExpenseEntryAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const supplier_id = (formData.get("supplier_id") as string) || null
    const category = formData.get("category") as string

    if (!amount || !description || !date || !category) {
      return { error: "Tüm gerekli alanları doldurun" }
    }

    const { error } = await supabase.from("expense_entries").insert({
      amount,
      description,
      date,
      supplier_id: supplier_id === "" ? null : supplier_id,
      category,
    })

    if (error) {
      console.error("Error creating expense entry:", error)
      return { error: "Gider kaydı oluşturulurken hata oluştu" }
    }

    revalidatePath("/financials/expenses")
    return { success: true, message: "Gider kaydı başarıyla oluşturuldu" }
  } catch (error) {
    console.error("Unexpected error creating expense entry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function getIncomeEntryById(id: string): Promise<IncomeEntry | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("income_entries")
      .select(`
        id,
        amount,
        description,
        date,
        customer_id,
        category,
        created_at,
        customers (
          company_name
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching income entry:", error)
      return null
    }

    return {
      ...data,
      customer: data.customers ? { company_name: data.customers.company_name } : undefined,
    }
  } catch (error) {
    console.error("Unexpected error fetching income entry:", error)
    return null
  }
}

export async function getExpenseEntryById(id: string): Promise<ExpenseEntry | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("expense_entries")
      .select(`
        id,
        amount,
        description,
        date,
        supplier_id,
        category,
        created_at,
        suppliers (
          company_name
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching expense entry:", error)
      return null
    }

    return {
      ...data,
      supplier: data.suppliers ? { company_name: data.suppliers.company_name } : undefined,
    }
  } catch (error) {
    console.error("Unexpected error fetching expense entry:", error)
    return null
  }
}

export async function updateIncomeEntryAction(id: string, prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const customer_id = (formData.get("customer_id") as string) || null
    const category = formData.get("category") as string

    if (!amount || !description || !date || !category) {
      return { error: "Tüm gerekli alanları doldurun" }
    }

    const { error } = await supabase
      .from("income_entries")
      .update({
        amount,
        description,
        date,
        customer_id: customer_id === "" ? null : customer_id,
        category,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating income entry:", error)
      return { error: "Gelir kaydı güncellenirken hata oluştu" }
    }

    revalidatePath("/financials/income")
    revalidatePath(`/financials/income/${id}`)
    return { success: true, message: "Gelir kaydı başarıyla güncellendi" }
  } catch (error) {
    console.error("Unexpected error updating income entry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateExpenseEntryAction(id: string, prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const supplier_id = (formData.get("supplier_id") as string) || null
    const category = formData.get("category") as string

    if (!amount || !description || !date || !category) {
      return { error: "Tüm gerekli alanları doldurun" }
    }

    const { error } = await supabase
      .from("expense_entries")
      .update({
        amount,
        description,
        date,
        supplier_id: supplier_id === "" ? null : supplier_id,
        category,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating expense entry:", error)
      return { error: "Gider kaydı güncellenirken hata oluştu" }
    }

    revalidatePath("/financials/expenses")
    revalidatePath(`/financials/expenses/${id}`)
    return { success: true, message: "Gider kaydı başarıyla güncellendi" }
  } catch (error) {
    console.error("Unexpected error updating expense entry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function deleteIncomeEntry(id: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("income_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting income entry:", error)
      return { error: "Gelir kaydı silinirken hata oluştu" }
    }

    revalidatePath("/financials/income")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting income entry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function deleteExpenseEntry(id: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("expense_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting expense entry:", error)
      return { error: "Gider kaydı silinirken hata oluştu" }
    }

    revalidatePath("/financials/expenses")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting expense entry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Alias exports for compatibility
export { updateIncomeEntryAction as updateIncomeEntry }
export { updateExpenseEntryAction as updateExpenseEntry }

// --- additional named exports expected elsewhere ---
export { createExpenseEntryAction as createExpenseEntry }
