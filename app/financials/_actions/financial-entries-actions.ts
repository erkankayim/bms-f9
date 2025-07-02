"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Helper function to get financial categories
export async function getFinancialCategories() {
  const supabase = await createClient()

  try {
    const { data: categories, error } = await supabase
      .from("chart_of_accounts")
      .select("id, account_name, account_type")
      .order("account_name")

    if (error) {
      console.error("Error fetching categories:", error)
      return { error: "Kategoriler yüklenemedi" }
    }

    return { data: categories || [] }
  } catch (error) {
    console.error("Error in getFinancialCategories:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Helper function to get customers for dropdown
export async function getCustomersForDropdown() {
  const supabase = await createClient()

  try {
    const { data: customers, error } = await supabase
      .from("customers")
      .select("mid, customer_name")
      .order("customer_name")

    if (error) {
      console.error("Error fetching customers:", error)
      return { error: "Müşteriler yüklenemedi" }
    }

    return { data: customers || [] }
  } catch (error) {
    console.error("Error in getCustomersForDropdown:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Helper function to get suppliers for dropdown
export async function getSuppliersForDropdown() {
  const supabase = await createClient()

  try {
    const { data: suppliers, error } = await supabase
      .from("suppliers")
      .select("id, supplier_name")
      .order("supplier_name")

    if (error) {
      console.error("Error fetching suppliers:", error)
      return { error: "Tedarikçiler yüklenemedi" }
    }

    return { data: suppliers || [] }
  } catch (error) {
    console.error("Error in getSuppliersForDropdown:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Income entries functions
export async function getIncomeEntries() {
  const supabase = await createClient()

  try {
    const { data: entries, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        entry_date,
        description,
        incoming_amount,
        payment_method,
        category_id,
        customer_id,
        chart_of_accounts!financial_entries_category_id_fkey(account_name),
        customers(customer_name)
      `)
      .gt("incoming_amount", 0)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Error fetching income entries:", error)
      return { error: "Gelir kayıtları yüklenemedi" }
    }

    // Transform the data to match expected format
    const transformedEntries =
      entries?.map((entry) => ({
        id: entry.id,
        entry_date: entry.entry_date,
        description: entry.description,
        incoming_amount: entry.incoming_amount,
        payment_method: entry.payment_method,
        category_id: entry.category_id,
        customer_id: entry.customer_id,
        category_name: entry.chart_of_accounts?.account_name || null,
        customer_name: entry.customers?.customer_name || null,
      })) || []

    return { data: transformedEntries }
  } catch (error) {
    console.error("Error in getIncomeEntries:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function getIncomeEntryById(id: number) {
  const supabase = await createClient()

  try {
    const { data: entry, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        entry_date,
        description,
        incoming_amount,
        payment_method,
        category_id,
        customer_id,
        chart_of_accounts!financial_entries_category_id_fkey(account_name),
        customers(customer_name)
      `)
      .eq("id", id)
      .gt("incoming_amount", 0)
      .single()

    if (error) {
      console.error("Error fetching income entry:", error)
      return { error: "Gelir kaydı bulunamadı" }
    }

    // Transform the data
    const transformedEntry = {
      id: entry.id,
      entry_date: entry.entry_date,
      description: entry.description,
      incoming_amount: entry.incoming_amount,
      payment_method: entry.payment_method,
      category_id: entry.category_id,
      customer_id: entry.customer_id,
      category_name: entry.chart_of_accounts?.account_name || null,
      customer_name: entry.customers?.customer_name || null,
    }

    return { data: transformedEntry }
  } catch (error) {
    console.error("Error in getIncomeEntryById:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function createIncomeEntry(formData: FormData) {
  const supabase = await createClient()

  try {
    const entryDate = formData.get("entry_date") as string
    const description = formData.get("description") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const paymentMethod = formData.get("payment_method") as string
    const categoryId = formData.get("category_id") as string
    const customerId = formData.get("customer_id") as string

    if (!entryDate || !description || !amount || !paymentMethod) {
      return { error: "Zorunlu alanlar eksik" }
    }

    const { error } = await supabase.from("financial_entries").insert({
      entry_date: entryDate,
      description,
      incoming_amount: amount,
      outgoing_amount: 0,
      payment_method: paymentMethod,
      category_id: categoryId ? Number.parseInt(categoryId) : null,
      customer_id: customerId || null,
    })

    if (error) {
      console.error("Error creating income entry:", error)
      return { error: "Gelir kaydı oluşturulamadı" }
    }

    revalidatePath("/financials/income")
    return { success: true }
  } catch (error) {
    console.error("Error in createIncomeEntry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateIncomeEntry(id: number, formData: FormData) {
  const supabase = await createClient()

  try {
    const entryDate = formData.get("entry_date") as string
    const description = formData.get("description") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const paymentMethod = formData.get("payment_method") as string
    const categoryId = formData.get("category_id") as string
    const customerId = formData.get("customer_id") as string

    if (!entryDate || !description || !amount || !paymentMethod) {
      return { error: "Zorunlu alanlar eksik" }
    }

    const { error } = await supabase
      .from("financial_entries")
      .update({
        entry_date: entryDate,
        description,
        incoming_amount: amount,
        payment_method: paymentMethod,
        category_id: categoryId ? Number.parseInt(categoryId) : null,
        customer_id: customerId || null,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating income entry:", error)
      return { error: "Gelir kaydı güncellenemedi" }
    }

    revalidatePath("/financials/income")
    revalidatePath(`/financials/income/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error in updateIncomeEntry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function deleteIncomeEntry(id: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("financial_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting income entry:", error)
      return { error: "Gelir kaydı silinemedi" }
    }

    revalidatePath("/financials/income")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteIncomeEntry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Expense entries functions
export async function getExpenseEntries() {
  const supabase = await createClient()

  try {
    const { data: entries, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        entry_date,
        description,
        outgoing_amount,
        payment_method,
        category_id,
        supplier_id,
        chart_of_accounts!financial_entries_category_id_fkey(account_name),
        suppliers(supplier_name)
      `)
      .gt("outgoing_amount", 0)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Error fetching expense entries:", error)
      return { error: "Gider kayıtları yüklenemedi" }
    }

    // Transform the data
    const transformedEntries =
      entries?.map((entry) => ({
        id: entry.id,
        entry_date: entry.entry_date,
        description: entry.description,
        outgoing_amount: entry.outgoing_amount,
        payment_method: entry.payment_method,
        category_id: entry.category_id,
        supplier_id: entry.supplier_id,
        category_name: entry.chart_of_accounts?.account_name || null,
        supplier_name: entry.suppliers?.supplier_name || null,
      })) || []

    return { data: transformedEntries }
  } catch (error) {
    console.error("Error in getExpenseEntries:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function getExpenseEntryById(id: number) {
  const supabase = await createClient()

  try {
    const { data: entry, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        entry_date,
        description,
        outgoing_amount,
        payment_method,
        category_id,
        supplier_id,
        chart_of_accounts!financial_entries_category_id_fkey(account_name),
        suppliers(supplier_name)
      `)
      .eq("id", id)
      .gt("outgoing_amount", 0)
      .single()

    if (error) {
      console.error("Error fetching expense entry:", error)
      return { error: "Gider kaydı bulunamadı" }
    }

    // Transform the data
    const transformedEntry = {
      id: entry.id,
      entry_date: entry.entry_date,
      description: entry.description,
      outgoing_amount: entry.outgoing_amount,
      payment_method: entry.payment_method,
      category_id: entry.category_id,
      supplier_id: entry.supplier_id,
      category_name: entry.chart_of_accounts?.account_name || null,
      supplier_name: entry.suppliers?.supplier_name || null,
    }

    return { data: transformedEntry }
  } catch (error) {
    console.error("Error in getExpenseEntryById:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function createExpenseEntry(formData: FormData) {
  const supabase = await createClient()

  try {
    const entryDate = formData.get("entry_date") as string
    const description = formData.get("description") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const paymentMethod = formData.get("payment_method") as string
    const categoryId = formData.get("category_id") as string
    const supplierId = formData.get("supplier_id") as string

    if (!entryDate || !description || !amount || !paymentMethod) {
      return { error: "Zorunlu alanlar eksik" }
    }

    const { error } = await supabase.from("financial_entries").insert({
      entry_date: entryDate,
      description,
      incoming_amount: 0,
      outgoing_amount: amount,
      payment_method: paymentMethod,
      category_id: categoryId ? Number.parseInt(categoryId) : null,
      supplier_id: supplierId ? Number.parseInt(supplierId) : null,
    })

    if (error) {
      console.error("Error creating expense entry:", error)
      return { error: "Gider kaydı oluşturulamadı" }
    }

    revalidatePath("/financials/expenses")
    return { success: true }
  } catch (error) {
    console.error("Error in createExpenseEntry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateExpenseEntry(id: number, formData: FormData) {
  const supabase = await createClient()

  try {
    const entryDate = formData.get("entry_date") as string
    const description = formData.get("description") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const paymentMethod = formData.get("payment_method") as string
    const categoryId = formData.get("category_id") as string
    const supplierId = formData.get("supplier_id") as string

    if (!entryDate || !description || !amount || !paymentMethod) {
      return { error: "Zorunlu alanlar eksik" }
    }

    const { error } = await supabase
      .from("financial_entries")
      .update({
        entry_date: entryDate,
        description,
        outgoing_amount: amount,
        payment_method: paymentMethod,
        category_id: categoryId ? Number.parseInt(categoryId) : null,
        supplier_id: supplierId ? Number.parseInt(supplierId) : null,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating expense entry:", error)
      return { error: "Gider kaydı güncellenemedi" }
    }

    revalidatePath("/financials/expenses")
    revalidatePath(`/financials/expenses/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error in updateExpenseEntry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function deleteExpenseEntry(id: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("financial_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting expense entry:", error)
      return { error: "Gider kaydı silinemedi" }
    }

    revalidatePath("/financials/expenses")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteExpenseEntry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Legacy aliases for backward compatibility
export const createIncomeEntryAction = createIncomeEntry
export const updateIncomeEntryAction = updateIncomeEntry
export const createExpenseEntryAction = createExpenseEntry
export const updateExpenseEntryAction = updateExpenseEntry
