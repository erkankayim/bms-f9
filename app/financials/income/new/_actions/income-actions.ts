"use server"

// Bu dosya, üst dizindeki ana Action'dan createIncome fonksiyonunu yeniden dışa aktarır.
// Böylece `app/financials/income/new/...` yolundan yapılan import’lar sorunsuz çalışır.

export { createIncome } from "../../_actions/income-actions"
