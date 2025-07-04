"use server"

import { deleteExpense as deleteExpenseMain } from "../../_actions/expense-actions"

export async function deleteExpense(id: string) {
  return await deleteExpenseMain(id)
}
