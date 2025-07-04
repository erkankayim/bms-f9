"use server"

import { deleteExpense as deleteExpenseMain } from "../../_actions/expense-actions"

export async function deleteExpense(formData: FormData) {
  return await deleteExpenseMain(formData)
}
