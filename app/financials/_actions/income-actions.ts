"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createIncomeEntry(formData: FormData) {
  const supabase = await createClient()

  // Get form data
  const description = formData.get("description") as string
  const incoming_amount = Number.parseFloat(formData.get("incoming_amount") as string)
  const source = formData.get("source") as string
  const entry_date = formData.get("entry_date") as string
  const notes = formData.get("notes") as string
  const payment_method = formData.get("payment_method") as string
  const customer_id = formData.get("customer_id") as string

  // Validate required fields
  if (!description || !incoming_amount || !entry_date) {
    throw new Error("Açıklama, tutar ve tarih alanları zorunludur")
  }

  if (incoming_amount <= 0) {
    throw new Error("Tutar sıfırdan büyük olmalıdır")
  }

  try {
    const { error } = await supabase.from("income_entries").insert({
      description,
      incoming_amount,
      source: source || null,
      entry_date,
      notes: notes || null,
      payment_method: payment_method || "cash",
      customer_id: customer_id || null,
    })

    if (error) {
      console.error("Income entry creation error:", error)
      throw new Error("Gelir kaydı oluşturulurken hata oluştu: " + error.message)
    }

    revalidatePath("/financials/income")
    redirect("/financials/income")
  } catch (error) {
    console.error("Error creating income entry:", error)
    throw error
  }
}

export async function getCustomers() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("customers").select("mid, name").order("name")

    if (error) {
      console.error("Error fetching customers:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}
