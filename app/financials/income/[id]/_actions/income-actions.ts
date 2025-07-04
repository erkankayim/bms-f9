"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteIncome(entryId: number) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("financial_entries").delete().eq("id", entryId).eq("entry_type", "income")

    if (error) {
      console.error("Income deletion error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/financials/income")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateIncomeEntryAction(entryId: number, updateData: any) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("financial_entries")
      .update({
        description: updateData.description,
        incoming_amount: updateData.incoming_amount,
        payment_amount: updateData.incoming_amount,
        entry_date: updateData.entry_date,
        income_source: updateData.income_source,
        category_id: updateData.category_id ? Number.parseInt(updateData.category_id) : null,
        customer_mid: updateData.customer_mid || null,
        payment_method: updateData.payment_method,
        invoice_number: updateData.invoice_number,
        notes: updateData.notes,
      })
      .eq("id", entryId)
      .eq("entry_type", "income")
      .select()
      .single()

    if (error) {
      console.error("Income update error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/financials/income/${entryId}`)
    revalidatePath("/financials/income")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}
