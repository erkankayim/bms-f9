"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { ExpenseEntrySchema, IncomeEntrySchema } from "../_lib/financial-entry-shared"

// Supabase client oluştur
async function createSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })
}

// Finansal kategorileri getir
export async function getFinancialCategories() {
  try {
    const supabase = await createSupabaseClient()

    const { data, error } = await supabase
      .from("chart_of_accounts")
      .select("id, account_code, account_name, account_type")
      .order("account_code")

    if (error) {
      console.error("Error fetching financial categories:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getFinancialCategories:", error)
    return []
  }
}

// Müşterileri dropdown için getir
export async function getCustomersForDropdown() {
  try {
    const supabase = await createSupabaseClient()

    const { data, error } = await supabase
      .from("customers")
      .select("id, company_name, first_name, last_name")
      .order("company_name")

    if (error) {
      console.error("Error fetching customers:", error)
      return []
    }

    return (
      data?.map((customer) => ({
        id: customer.id,
        name: customer.company_name || `${customer.first_name} ${customer.last_name}`.trim(),
      })) || []
    )
  } catch (error) {
    console.error("Error in getCustomersForDropdown:", error)
    return []
  }
}

// Tedarikçileri dropdown için getir
export async function getSuppliersForDropdown() {
  try {
    const supabase = await createSupabaseClient()

    const { data, error } = await supabase
      .from("suppliers")
      .select("id, company_name, contact_name")
      .order("company_name")

    if (error) {
      console.error("Error fetching suppliers:", error)
      return []
    }

    return (
      data?.map((supplier) => ({
        id: supplier.id,
        name: supplier.company_name || supplier.contact_name,
      })) || []
    )
  } catch (error) {
    console.error("Error in getSuppliersForDropdown:", error)
    return []
  }
}

// Gelir kayıtlarını getir
export async function getIncomeEntries() {
  try {
    const supabase = await createSupabaseClient()

    const { data, error } = await supabase
      .from("income_entries")
      .select(`
        *,
        customers (
          id,
          company_name,
          first_name,
          last_name
        ),
        chart_of_accounts (
          id,
          account_name,
          account_code
        )
      `)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Error fetching income entries:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getIncomeEntries:", error)
    return []
  }
}

// Gelir kaydını ID ile getir
export async function getIncomeEntryById(id: string) {
  try {
    const supabase = await createSupabaseClient()

    const { data, error } = await supabase
      .from("income_entries")
      .select(`
        *,
        customers (
          id,
          company_name,
          first_name,
          last_name
        ),
        chart_of_accounts (
          id,
          account_name,
          account_code
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching income entry:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getIncomeEntryById:", error)
    return null
  }
}

// Gider kayıtlarını getir
export async function getExpenseEntries() {
  try {
    const supabase = await createSupabaseClient()

    const { data, error } = await supabase
      .from("expense_entries")
      .select(`
        *,
        suppliers (
          id,
          company_name,
          contact_name
        ),
        chart_of_accounts (
          id,
          account_name,
          account_code
        )
      `)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Error fetching expense entries:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getExpenseEntries:", error)
    return []
  }
}

// Gider kaydını ID ile getir
export async function getExpenseEntryById(id: string) {
  try {
    const supabase = await createSupabaseClient()

    const { data, error } = await supabase
      .from("expense_entries")
      .select(`
        *,
        suppliers (
          id,
          company_name,
          contact_name
        ),
        chart_of_accounts (
          id,
          account_name,
          account_code
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching expense entry:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getExpenseEntryById:", error)
    return null
  }
}

// Yeni gelir kaydı oluştur
export async function createIncomeEntry(data: IncomeEntrySchema) {
  try {
    const supabase = await createSupabaseClient()

    const { data: result, error } = await supabase
      .from("income_entries")
      .insert([
        {
          description: data.description,
          amount: data.amount,
          entry_date: data.entry_date,
          payment_method: data.payment_method,
          customer_id: data.customer_id || null,
          category_id: data.category_id,
          notes: data.notes || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating income entry:", error)
      throw new Error("Gelir kaydı oluşturulurken hata oluştu")
    }

    revalidatePath("/financials/income")
    return { success: true, data: result }
  } catch (error) {
    console.error("Error in createIncomeEntry:", error)
    return { success: false, error: "Gelir kaydı oluşturulurken hata oluştu" }
  }
}

// Yeni gider kaydı oluştur
export async function createExpenseEntry(data: ExpenseEntrySchema) {
  try {
    const supabase = await createSupabaseClient()

    const { data: result, error } = await supabase
      .from("expense_entries")
      .insert([
        {
          description: data.description,
          amount: data.amount,
          entry_date: data.entry_date,
          payment_method: data.payment_method,
          supplier_id: data.supplier_id || null,
          category_id: data.category_id,
          notes: data.notes || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating expense entry:", error)
      throw new Error("Gider kaydı oluşturulurken hata oluştu")
    }

    revalidatePath("/financials/expenses")
    return { success: true, data: result }
  } catch (error) {
    console.error("Error in createExpenseEntry:", error)
    return { success: false, error: "Gider kaydı oluşturulurken hata oluştu" }
  }
}

// Gelir kaydını güncelle
export async function updateIncomeEntry(id: string, data: IncomeEntrySchema) {
  try {
    const supabase = await createSupabaseClient()

    const { data: result, error } = await supabase
      .from("income_entries")
      .update({
        description: data.description,
        amount: data.amount,
        entry_date: data.entry_date,
        payment_method: data.payment_method,
        customer_id: data.customer_id || null,
        category_id: data.category_id,
        notes: data.notes || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating income entry:", error)
      throw new Error("Gelir kaydı güncellenirken hata oluştu")
    }

    revalidatePath("/financials/income")
    revalidatePath(`/financials/income/${id}`)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error in updateIncomeEntry:", error)
    return { success: false, error: "Gelir kaydı güncellenirken hata oluştu" }
  }
}

// Gider kaydını güncelle
export async function updateExpenseEntry(id: string, data: ExpenseEntrySchema) {
  try {
    const supabase = await createSupabaseClient()

    const { data: result, error } = await supabase
      .from("expense_entries")
      .update({
        description: data.description,
        amount: data.amount,
        entry_date: data.entry_date,
        payment_method: data.payment_method,
        supplier_id: data.supplier_id || null,
        category_id: data.category_id,
        notes: data.notes || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating expense entry:", error)
      throw new Error("Gider kaydı güncellenirken hata oluştu")
    }

    revalidatePath("/financials/expenses")
    revalidatePath(`/financials/expenses/${id}`)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error in updateExpenseEntry:", error)
    return { success: false, error: "Gider kaydı güncellenirken hata oluştu" }
  }
}

// Gelir kaydını sil
export async function deleteIncomeEntry(id: string) {
  try {
    const supabase = await createSupabaseClient()

    const { error } = await supabase.from("income_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting income entry:", error)
      throw new Error("Gelir kaydı silinirken hata oluştu")
    }

    revalidatePath("/financials/income")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteIncomeEntry:", error)
    return { success: false, error: "Gelir kaydı silinirken hata oluştu" }
  }
}

// Gider kaydını sil
export async function deleteExpenseEntry(id: string) {
  try {
    const supabase = await createSupabaseClient()

    const { error } = await supabase.from("expense_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting expense entry:", error)
      throw new Error("Gider kaydı silinirken hata oluştu")
    }

    revalidatePath("/financials/expenses")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteExpenseEntry:", error)
    return { success: false, error: "Gider kaydı silinirken hata oluştu" }
  }
}

// Legacy aliases for backward compatibility
export const createIncomeEntryAction = createIncomeEntry
export const createExpenseEntryAction = createExpenseEntry
export const updateIncomeEntryAction = updateIncomeEntry
export const updateExpenseEntryAction = updateExpenseEntry
