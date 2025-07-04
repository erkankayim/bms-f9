"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createExpense(expenseData: any) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("financial_entries")
      .insert({
        entry_type: "expense",
        expense_title: expenseData.expense_title,
        description: expenseData.description,
        expense_amount: expenseData.expense_amount,
        outgoing_amount: expenseData.expense_amount,
        payment_amount: expenseData.payment_amount,
        incoming_amount: 0,
        entry_date: expenseData.entry_date,
        expense_source: expenseData.expense_source,
        category_id: expenseData.category_id ? Number.parseInt(expenseData.category_id) : null,
        supplier_id: expenseData.supplier_id ? Number.parseInt(expenseData.supplier_id) : null,
        payment_method: expenseData.payment_method,
        invoice_number: expenseData.invoice_number,
        receipt_url: expenseData.receipt_url,
        notes: expenseData.notes,
      })
      .select()
      .single()

    if (error) {
      console.error("Expense creation error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/financials/expenses")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}
