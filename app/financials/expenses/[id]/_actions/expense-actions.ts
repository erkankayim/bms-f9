"use server"

/**
 * Proxy server action so that files inside
 * `app/financials/expenses/[id]/…` can import:
 *
 *   import { deleteExpense } from "./_actions/expense-actions"
 *
 * Next 15 requires that every export from a `"use server"` file
 * is an async function, so we wrap the real implementation.
 */

import { deleteExpense as deleteExpenseBase } from "../../_actions/expense-actions"

/**
 * Delete a single expense entry and revalidate the list.
 * Delegates to the canonical implementation in
 * `app/financials/expenses/_actions/expense-actions.ts`.
 */
export async function deleteExpense(id: string) {
  // simply forward the call
  return deleteExpenseBase(id)
}
