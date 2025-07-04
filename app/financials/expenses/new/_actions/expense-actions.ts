"use server"

// Bu dosya, üst dizindeki ana Action'dan createExpense fonksiyonunu yeniden dışa aktarır.
// Böylece `app/financials/expenses/new/...` yolundan yapılan import’lar sorunsuz çalışır.

export { createExpense } from "../../_actions/expense-actions"
