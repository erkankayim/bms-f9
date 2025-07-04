"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createIncome(incomeData: any) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("financial_entries")
      .insert({
        entry_type: "income",
        description: incomeData.description,
        incoming_amount: incomeData.incoming_amount,
        outgoing_amount: 0,
        payment_amount: incomeData.incoming_amount,
        entry_date: incomeData.entry_date,
        income_source: incomeData.income_source,
        category_id: incomeData.category_id ? Number.parseInt(incomeData.category_id) : null,
        customer_mid: incomeData.customer_mid || null,
        payment_method: incomeData.payment_method,
        invoice_number: incomeData.invoice_number,
        notes: incomeData.notes,
      })
      .select()
      .single()

    if (error) {
      console.error("Income creation error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/financials/income")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}
