"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createExpenseEntry(formData: FormData) {
  const supabase = await createClient()

  // Get form data
  const description = formData.get("description") as string
  const outgoing_amount = Number.parseFloat(formData.get("outgoing_amount") as string)
  const category = formData.get("category") as string
  const entry_date = formData.get("entry_date") as string
  const notes = formData.get("notes") as string
  const payment_method = formData.get("payment_method") as string
  const supplier_id = formData.get("supplier_id") as string

  // Validate required fields
  if (!description || !outgoing_amount || !category || !entry_date) {
    throw new Error("Açıklama, tutar, kategori ve tarih alanları zorunludur")
  }

  if (outgoing_amount <= 0) {
    throw new Error("Tutar sıfırdan büyük olmalıdır")
  }

  try {
    const { error } = await supabase.from("expense_entries").insert({
      description,
      outgoing_amount,
      category,
      entry_date,
      notes: notes || null,
      payment_method: payment_method || "cash",
      supplier_id: supplier_id ? Number.parseInt(supplier_id) : null,
    })

    if (error) {
      console.error("Expense entry creation error:", error)
      throw new Error("Gider kaydı oluşturulurken hata oluştu: " + error.message)
    }

    revalidatePath("/financials/expenses")
    redirect("/financials/expenses")
  } catch (error) {
    console.error("Error creating expense entry:", error)
    throw error
  }
}

export async function getSuppliers() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("suppliers").select("id, name").order("name")

    if (error) {
      console.error("Error fetching suppliers:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return []
  }
}
