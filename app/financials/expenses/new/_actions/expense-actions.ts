"use server"

import { createExpense as mainCreateExpense } from "../../_actions/expense-actions"

export async function createExpense(formData: FormData) {
  return await mainCreateExpense(formData)
}
