"use server"

import { createIncomeEntry, getCustomers, createIncome as mainCreateIncome } from "../../_actions/income-actions"

export async function createIncome(formData: FormData) {
  return await mainCreateIncome(formData)
}

export { createIncomeEntry, getCustomers }
