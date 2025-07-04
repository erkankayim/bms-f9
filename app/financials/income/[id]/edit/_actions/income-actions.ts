"use server"

import { updateIncomeEntryAction as _updateIncomeEntryAction } from "../../../_actions/income-actions"

/**
 * Server action proxy so the file satisfies Next.js “use server” constraints.
 */
export async function updateIncomeEntryAction(...args: Parameters<typeof _updateIncomeEntryAction>) {
  return _updateIncomeEntryAction(...args)
}
