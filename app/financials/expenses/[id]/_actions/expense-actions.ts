"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function deleteExpense(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("expense_entries").delete().eq("id", id)

  if (error) {
    console.error("[deleteExpense] DB error:", error)
    throw new Error("Gider silinirken hata oluştu")
  }

  revalidatePath("/financials/expenses")
  redirect("/financials/expenses")
}
