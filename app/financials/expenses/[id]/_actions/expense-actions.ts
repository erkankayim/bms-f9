"use server"

import { deleteExpense as mainDeleteExpense } from "../../_actions/expense-actions"

export async function deleteExpense(id: string) {
  return await mainDeleteExpense(id)
}
