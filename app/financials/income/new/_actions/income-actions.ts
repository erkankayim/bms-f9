"use server"

import { createIncome as _createIncome } from "../../_actions/income-actions"

/**
 * Proxy Action — yeni gelir formu, bu yolu import ederek server action
 * kullanabilsin. Burada yalnızca async bir fonksiyon ihraç ediyoruz.
 */
export async function createIncome(formData: FormData) {
  return _createIncome(formData)
}
