"use server"

import { createClient } from "@/lib/supabase/server"

export async function getExpenseEntries() {
  const supabase = createClient()

  try {
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

    if (error) throw error

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
