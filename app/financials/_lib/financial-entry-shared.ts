import { z } from "zod"

/* ------------------------------------------------------------------ */
/* Sabitler                                                            */
/* ------------------------------------------------------------------ */
export const PAYMENT_METHODS = ["Nakit", "Kredi Kartı", "Banka Transferi", "Çek", "Senet", "Diğer"] as const

/* Finans ve envanter menülerinde kullanılıyor */
export const expenseCategories = [
  "Ofis Giderleri",
  "Kira",
  "Elektrik",
  "Su",
  "İnternet",
  "Telefon",
  "Yakıt",
  "Yemek",
  "Malzeme",
  "Pazarlama",
  "Diğer",
] as const

export const incomeCategories = [
  "Satış Geliri",
  "Hizmet Geliri",
  "Faiz Geliri",
  "Kira Geliri",
  "Diğer Gelirler",
] as const

/* ------------------------------------------------------------------ */
/* Schemas                                                             */
/* ------------------------------------------------------------------ */
export const IncomeEntrySchema = z.object({
  description: z.string().min(1, "Açıklama gereklidir"),
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  entry_date: z.string().min(1, "Tarih gereklidir"),
  payment_method: z.enum(PAYMENT_METHODS),
  customer_id: z.string().optional().nullable(),
  category_id: z.string().min(1, "Kategori gereklidir"),
  notes: z.string().optional().nullable(),
})

export const ExpenseEntrySchema = z.object({
  description: z.string().min(1, "Açıklama gereklidir"),
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  entry_date: z.string().min(1, "Tarih gereklidir"),
  payment_method: z.enum(PAYMENT_METHODS),
  supplier_id: z.string().optional().nullable(),
  category_id: z.string().min(1, "Kategori gereklidir"),
  notes: z.string().optional().nullable(),
})

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type IncomeEntry = z.infer<typeof IncomeEntrySchema>
export type ExpenseEntry = z.infer<typeof ExpenseEntrySchema>
