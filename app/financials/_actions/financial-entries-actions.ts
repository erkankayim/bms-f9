"use server"

/**
 * Thin compatibility layer so legacy imports compile.
 * All helpers proxy to the new consolidated file in /_actions/actions.
 */

import * as NewActions from "../_actions/actions"

export const { getFinancialCategories, getCustomers, getSuppliers, getIncomeEntries, getExpenseEntries } = NewActions

// Legacy create actions (return same shape as before)
export async function createIncomeEntryAction(formData: FormData) {
  return NewActions.createIncomeEntry(formData)
}

export async function createExpenseEntryAction(formData: FormData) {
  return NewActions.createExpenseEntry(formData)
}

/* Dropdown helpers kept for backwards compatibility */
export async function getCustomersForDropdown() {
  const data = await NewActions.getCustomers()
  return { data }
}

export async function getSuppliersForDropdown() {
  const data = await NewActions.getSuppliers()
  return { data }
}
