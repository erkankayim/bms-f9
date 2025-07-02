"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  FinancialCategory,
  CustomerForDropdown,
  SupplierForDropdown,
  IncomeEntryWithDetails,
  ExpenseEntry,
} from "./types"

// Data fetching functions
export async function getFinancialCategories(
  type: "income" | "expense" = "income",
): Promise<{ data?: FinancialCategory[]; error?: string }> {
  try {
    const supabase = createClient()

    console.log(`Fetching ${type} categories...`)

    // Try to get categories from chart_of_accounts table
    const { data, error } = await supabase.from("chart_of_accounts").select("id, name, type, description").order("name")

    if (error) {
      console.error("Database error for financial categories:", error)

      // Return default categories if database fails
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
      console.log(`Returning ${defaultCategories.length} default ${type} categories`)
      return { data: defaultCategories }
    }

    // Transform chart_of_accounts data to match expected format
    const transformedData =
      data?.map((item) => ({
        id: item.id,
        name: item.name,
        type: type,
        description: item.description,
      })) || []

    console.log(`Found ${transformedData.length} ${type} categories in database`)
    return { data: transformedData as FinancialCategory[] }
  } catch (error) {
    console.error("Unexpected error fetching financial categories:", error)
    return { error: `Finansal kategoriler alınırken beklenmeyen hata: ${error}` }
  }
}

export async function getCustomersForDropdown(): Promise<{ data: CustomerForDropdown[] | null; error: string | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("customers").select("mid, contact_name, email").order("contact_name")

    if (error) {
      console.error("Database error:", error)
      return { data: null, error: `Müşteriler alınırken hata: ${error.message}` }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { data: null, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function getSuppliersForDropdown(): Promise<{ data: SupplierForDropdown[] | null; error: string | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("suppliers")
      .select("id, company_name, contact_name")
      .order("company_name")

    if (error) {
      console.error("Database error:", error)
      return { data: null, error: `Tedarikçiler alınırken hata: ${error.message}` }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { data: null, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function getIncomeEntries(): Promise<{ data?: IncomeEntryWithDetails[]; error?: string }> {
  try {
    const supabase = createClient()

    // First check if income_entries table exists, if not use financial_entries
    const { data, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        description,
        amount,
        entry_date,
        payment_method,
        customer_mid,
        created_at
      `)
      .gt("amount", 0)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Database error for income entries:", error)
      return { error: `Gelir kayıtları alınırken hata: ${error.message}` }
    }

    const formattedData =
      data?.map((entry: any) => ({
        id: entry.id,
        description: entry.description,
        incoming_amount: entry.amount,
        entry_date: entry.entry_date,
        source: "Satış",
        invoice_number: null,
        payment_method: entry.payment_method || "Nakit",
        notes: null,
        customer_id: entry.customer_mid,
        category_id: 1,
        customer_mid: entry.customer_mid,
        customer_name: null,
        category_name: "Gelir",
        created_at: entry.created_at,
      })) || []

    return { data: formattedData }
  } catch (error) {
    console.error("Unexpected error fetching income entries:", error)
    return { error: `Gelir kayıtları alınırken beklenmeyen hata: ${error}` }
  }
}

export async function getIncomeEntryById(id: number): Promise<{ data?: IncomeEntryWithDetails; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        description,
        amount,
        entry_date,
        payment_method,
        customer_mid,
        created_at
      `)
      .eq("id", id)
      .gt("amount", 0)
      .single()

    if (error) {
      console.error(`Database error for income entry ${id}:`, error)
      return { error: `Gelir kaydı alınırken hata: ${error.message}` }
    }

    const formattedData = {
      id: data.id,
      description: data.description,
      incoming_amount: data.amount,
      entry_date: data.entry_date,
      source: "Satış",
      invoice_number: null,
      payment_method: data.payment_method || "Nakit",
      notes: null,
      customer_id: data.customer_mid,
      category_id: 1,
      customer_mid: data.customer_mid,
      customer_name: null,
      category_name: "Gelir",
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
      .from("financial_entries")
      .select(`
        id,
        description,
        amount,
        entry_date,
        payment_method,
        supplier_id,
        created_at
      `)
      .lt("amount", 0)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Database error for expense entries:", error)
      return { error: `Gider kayıtları alınırken hata: ${error.message}` }
    }

    const formattedData =
      data?.map((entry: any) => ({
        id: entry.id,
        description: entry.description,
        expense_amount: Math.abs(entry.amount),
        payment_amount: Math.abs(entry.amount),
        expense_title: entry.description,
        expense_source: "Gider",
        entry_date: entry.entry_date,
        invoice_number: null,
        payment_method: entry.payment_method || "Nakit",
        notes: null,
        supplier_id: entry.supplier_id,
        supplier_name: null,
        category_name: "Gider",
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
      .from("financial_entries")
      .select(`
        id,
        description,
        amount,
        entry_date,
        payment_method,
        supplier_id,
        created_at
      `)
      .eq("id", id)
      .lt("amount", 0)
      .single()

    if (error) {
      console.error(`Database error for expense entry ${id}:`, error)
      return { error: `Gider kaydı alınırken hata: ${error.message}` }
    }

    const formattedData = {
      id: data.id,
      description: data.description,
      expense_amount: Math.abs(data.amount),
      payment_amount: Math.abs(data.amount),
      expense_title: data.description,
      expense_source: "Gider",
      entry_date: data.entry_date,
      invoice_number: null,
      payment_method: data.payment_method || "Nakit",
      notes: null,
      supplier_id: data.supplier_id,
      supplier_name: null,
      category_name: "Gider",
      created_at: data.created_at,
    }

    return { data: formattedData }
  } catch (error) {
    console.error("Unexpected error fetching expense entry:", error)
    return { error: `Gider kaydı alınırken beklenmeyen hata: ${error}` }
  }
}

export async function updateIncomeEntry(id: number, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const customerMid = formData.get("customer_mid") as string
    const paymentMethod = formData.get("payment_method") as string

    if (!amount || !description || !date) {
      return { success: false, error: "Gerekli alanlar eksik" }
    }

    const { error } = await supabase
      .from("financial_entries")
      .update({
        amount,
        description,
        date,
        customer_mid: customerMid || null,
        payment_method: paymentMethod || null,
      })
      .eq("id", id)

    if (error) {
      console.error("Database error updating income entry:", error)
      return { success: false, error: `Gelir kaydı güncellenirken hata: ${error.message}` }
    }

    revalidatePath("/financials/income")
    revalidatePath(`/financials/income/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error updating income entry:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateExpenseEntry(
  id: number,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const supplierIdStr = formData.get("supplier_id") as string
    const paymentMethod = formData.get("payment_method") as string

    if (!amount || !description || !date) {
      return { success: false, error: "Gerekli alanlar eksik" }
    }

    const supplier_id = supplierIdStr ? supplierIdStr : null

    const { error } = await supabase
      .from("financial_entries")
      .update({
        amount: -Math.abs(amount), // keep negative
        description,
        date,
        supplier_id,
        payment_method: paymentMethod || null,
      })
      .eq("id", id)

    if (error) {
      console.error("Database error updating expense entry:", error)
      return { success: false, error: `Gider kaydı güncellenirken hata: ${error.message}` }
    }

    revalidatePath("/financials/expenses")
    revalidatePath(`/financials/expenses/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error updating expense entry:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function deleteIncomeEntry(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("financial_entries").delete().eq("id", id)

    if (error) {
      console.error(`Database error deleting income entry ${id}:`, error)
      return { success: false, message: `Gelir kaydı silinirken hata: ${error.message}` }
    }

    revalidatePath("/financials/income")
    return { success: true, message: "Gelir kaydı başarıyla silindi." }
  } catch (error) {
    console.error("Unexpected error deleting income entry:", error)
    return { success: false, message: `Gelir kaydı silinirken beklenmeyen hata: ${error}` }
  }
}

export async function deleteExpenseEntry(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("financial_entries").delete().eq("id", id)

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

export async function createIncomeEntry(formData: FormData) {
  try {
    const supabase = createClient()

    // Get form data
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const customerMid = formData.get("customer_mid") as string
    const paymentMethod = formData.get("payment_method") as string

    // Validate required fields
    if (!amount || !description || !date) {
      return { success: false, error: "Gerekli alanlar eksik" }
    }

    // Insert income entry
    const { error } = await supabase.from("financial_entries").insert({
      type: "income",
      amount,
      description,
      date,
      customer_mid: customerMid || null,
      payment_method: paymentMethod || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: `Gelir kaydı oluşturulurken hata: ${error.message}` }
    }

    revalidatePath("/financials/income")
    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function createExpenseEntry(formData: FormData) {
  try {
    const supabase = createClient()

    // Get form data
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const supplierIdStr = formData.get("supplier_id") as string
    const paymentMethod = formData.get("payment_method") as string

    // Validate required fields
    if (!amount || !description || !date) {
      return { success: false, error: "Gerekli alanlar eksik" }
    }

    // Convert supplier_id to UUID if provided
    let supplierId: string | null = null
    if (supplierIdStr && supplierIdStr !== "") {
      supplierId = supplierIdStr
    }

    // Insert expense entry (negative amount for expenses)
    const { error } = await supabase.from("financial_entries").insert({
      type: "expense",
      amount: -Math.abs(amount), // Make sure it's negative
      description,
      date,
      supplier_id: supplierId,
      payment_method: paymentMethod || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: `Gider kaydı oluşturulurken hata: ${error.message}` }
    }

    revalidatePath("/financials/expenses")
    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

// Legacy aliases for backward compatibility
export const createIncomeEntryAction = createIncomeEntry
export const createExpenseEntryAction = createExpenseEntry
export const updateIncomeEntryAction = updateIncomeEntry
export const updateExpenseEntryAction = updateExpenseEntry
