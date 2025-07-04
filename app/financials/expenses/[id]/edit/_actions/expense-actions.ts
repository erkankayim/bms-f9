"use server"

import { updateExpenseEntryAction as _updateExpenseEntryAction } from "../../../_actions/expense-actions"

/**
 * Server action proxy so the file satisfies Next.js “use server” constraints.
 */
export async function updateExpenseEntryAction(...args: Parameters<typeof _updateExpenseEntryAction>) {
  return _updateExpenseEntryAction(...args)
}
