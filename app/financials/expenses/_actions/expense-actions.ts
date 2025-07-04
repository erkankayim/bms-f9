"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getExpenseEntries() {
  const supabase = createClient()

  try {
    console.log("Fetching expense entries...")

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
      console.error("Database error:", error)
      throw error
    }

    console.log(`Found ${data?.length || 0} expense entries`)

    const formattedData =
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
        supplier_name: entry.suppliers?.name || null,
        category_name: entry.financial_categories?.name || null,
      })) || []

    return { data: formattedData }
  } catch (error) {
    console.error("Expense entries fetch error:", error)
    return {
      error: error instanceof Error ? error.message : "Gider kayıtları alınırken hata oluştu",
    }
  }
}

export async function getExpenseById(id: string) {
  const supabase = createClient()

  try {
    console.log(`Fetching expense with id: ${id}`)

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
        category_id,
        supplier_id,
        created_at,
        updated_at,
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
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    return {
      data: {
        ...data,
        supplier: data.suppliers,
        category: data.financial_categories,
      },
    }
  } catch (error) {
    console.error("Expense fetch error:", error)
    return {
      error: error instanceof Error ? error.message : "Gider kaydı alınırken hata oluştu",
    }
  }
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = createClient()

  try {
    const description = formData.get("description") as string
    const expense_amount = Number.parseFloat(formData.get("expense_amount") as string)
    const payment_amount = Number.parseFloat(formData.get("payment_amount") as string)
    const expense_title = formData.get("expense_title") as string
    const expense_source = formData.get("expense_source") as string
    const entry_date = formData.get("entry_date") as string
    const category_id = Number.parseInt(formData.get("category_id") as string)
    const supplier_id = (formData.get("supplier_id") as string) || null
    const invoice_number = (formData.get("invoice_number") as string) || null
    const payment_method = formData.get("payment_method") as string
    const notes = (formData.get("notes") as string) || null

    const { error } = await supabase
      .from("expense_entries")
      .update({
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
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/financials/expenses")
    revalidatePath(`/financials/expenses/${id}`)
    redirect(`/financials/expenses/${id}`)
  } catch (error) {
    console.error("Expense update error:", error)
    return {
      error: error instanceof Error ? error.message : "Gider güncellenirken hata oluştu",
    }
  }
}

export async function deleteExpense(id: string) {
  const supabase = createClient()

  try {
    console.log(`Deleting expense with id: ${id}`)

    const { error } = await supabase.from("expense_entries").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/financials/expenses")
    return { success: true }
  } catch (error) {
    console.error("Expense delete error:", error)
    return {
      error: error instanceof Error ? error.message : "Gider silinirken hata oluştu",
    }
  }
}

export async function getFinancialCategories() {
  const supabase = createClient()

  try {
    // Önce financial_categories tablosunu deneyelim
    const { data, error } = await supabase
      .from("financial_categories")
      .select("id, name")
      .eq("type", "expense")
      .order("name")

    if (error) {
      console.error("Categories fetch error:", error)
      // Hata varsa varsayılan kategoriler döndür
      return {
        data: [
          { id: 1, name: "Ofis Giderleri" },
          { id: 2, name: "Personel Giderleri" },
          { id: 3, name: "Pazarlama Giderleri" },
          { id: 4, name: "Diğer Giderler" },
        ],
      }
    }

    return { data: data || [] }
  } catch (error) {
    console.error("Categories fetch error:", error)
    return {
      data: [
        { id: 1, name: "Ofis Giderleri" },
        { id: 2, name: "Personel Giderleri" },
        { id: 3, name: "Pazarlama Giderleri" },
        { id: 4, name: "Diğer Giderler" },
      ],
    }
  }
}

export async function getSuppliers() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("suppliers").select("id, name").order("name")

    if (error) {
      console.error("Suppliers fetch error:", error)
      return { data: [] }
    }

    return { data: data || [] }
  } catch (error) {
    console.error("Suppliers fetch error:", error)
    return { data: [] }
  }
}
