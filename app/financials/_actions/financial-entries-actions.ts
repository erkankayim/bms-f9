"use server"

/**
 * Bu dosya, gelir-gider ortak sunucu-aksiyonlarını barındırır.
 * Şu anda minimal/stub uygulamaları içerir; dilediğiniz zaman
 * Supabase sorgularıyla zenginleştirebilirsiniz.
 */

import { revalidatePath } from "next/cache"

/* ---------- Ortak yardımcılar ---------- */

/**
 * Finansal kategori listesini döner.
 * type: "income" | "expense"
 */
export async function getFinancialCategories(type: "income" | "expense" = "income") {
  // Gerçek uygulamada Supabase sorgusu yapabilirsiniz
  return {
    data:
      type === "income"
        ? [{ id: 1, name: "Genel Gelir", type: "income", description: "Varsayılan gelir kategorisi" }]
        : [{ id: 2, name: "Genel Gider", type: "expense", description: "Varsayılan gider kategorisi" }],
  }
}

/**
 * Müşterileri dropdown için döner.
 */
export async function getCustomersForDropdown() {
  return { data: [] } // Supabase sorgusu ekleyin
}

/* ---------- Gelir (Income) ---------- */

export async function getIncomeEntryById(id: string) {
  return { data: null } // Supabase sorgusu ekleyin
}

export async function updateIncomeEntryAction(id: string, _prev: any, _formData: FormData) {
  // … doğrulama ve DB güncellemesi
  revalidatePath("/financials/income")
  return { success: true }
}

export async function deleteIncomeEntry(id: string) {
  // … Supabase delete
  revalidatePath("/financials/income")
  return { success: true }
}

/* ---------- Gider (Expense) ---------- */

export async function updateExpenseEntry(id: string, _prev: any, _formData: FormData) {
  // … doğrulama ve DB güncellemesi
  revalidatePath("/financials/expenses")
  return { success: true }
}
