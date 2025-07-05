"use server"

import { createClient } from "@/lib/supabase/server"

export async function getIncomeEntries() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("income_entries")
      .select(`
        id,
        description,
        incoming_amount,
        entry_date,
        source,
        invoice_number,
        payment_method,
        notes,
        created_at,
        customers!mid (
          contact_name
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
        incoming_amount: entry.incoming_amount,
        entry_date: entry.entry_date,
        source: entry.source,
        invoice_number: entry.invoice_number,
        payment_method: entry.payment_method,
        notes: entry.notes,
        created_at: entry.created_at,
        customer_name: entry.customers?.contact_name || null,
        category_name: entry.financial_categories?.name || null,
      })) || []

    return { data: formattedData }
  } catch (error) {
    console.error("Income entries fetch error:", error)
    return {
      error: error instanceof Error ? error.message : "Gelir kayıtları alınırken hata oluştu",
    }
  }
}
