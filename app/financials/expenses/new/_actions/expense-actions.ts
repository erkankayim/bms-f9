"use server"

import { createExpense as _createExpense } from "../../_actions/expense-actions"

/**
 * Proxy Action — yeni gider formu, bu yolu import ederek server action
 * kullanabilsin. Burada yalnızca async bir fonksiyon ihraç ediyoruz.
 */
export async function createExpense(formData: FormData) {
  return _createExpense(formData)
}
