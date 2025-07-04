"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
        customers!customer_id (
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

export async function createIncome(formData: FormData) {
  "use server"

  const supabase = createClient()

  try {
    const description = formData.get("description") as string
    const incoming_amount = Number.parseFloat(formData.get("incoming_amount") as string)
    const source = formData.get("source") as string
    const entry_date = formData.get("entry_date") as string
    const invoice_number = (formData.get("invoice_number") as string) || null
    const payment_method = formData.get("payment_method") as string
    const notes = (formData.get("notes") as string) || null
    const category_id = Number.parseInt(formData.get("category_id") as string)
    const customer_id = (formData.get("customer_id") as string) || null

    const { data, error } = await supabase
      .from("income_entries")
      .insert({
        description,
        incoming_amount,
        source,
        entry_date,
        invoice_number,
        payment_method,
        notes,
        category_id,
        customer_id,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) throw error

    // Revalidate list & redirect to detail page
    revalidatePath("/financials/income")
    redirect(`/financials/income/${data.id}`)
  } catch (error) {
    console.error("Income create error:", error)
    return {
      error: error instanceof Error ? error.message : "Gelir eklenirken hata oluştu",
    }
  }
}
