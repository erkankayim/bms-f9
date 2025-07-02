import { z } from "zod"

// Common payment methods used across the app
export const PAYMENT_METHODS = ["Nakit", "Kredi Kartı", "Banka Transferi", "Çek", "Senet", "Diğer"] as const

export const ExpenseEntrySchema = z.object({
  description: z.string().min(1, "Açıklama gereklidir"),
  amount: z
    .string()
    .min(1, "Tutar gereklidir")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Geçerli bir tutar girin"),
  category: z.string().min(1, "Kategori seçiniz"),
  account_id: z.string().min(1, "Hesap seçiniz"),
  entry_date: z.string().min(1, "Tarih seçiniz"),
})

export const IncomeEntrySchema = z.object({
  description: z.string().min(1, "Açıklama gereklidir"),
  amount: z
    .string()
    .min(1, "Tutar gereklidir")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Geçerli bir tutar girin"),
  category: z.string().min(1, "Kategori seçiniz"),
  account_id: z.string().min(1, "Hesap seçiniz"),
  entry_date: z.string().min(1, "Tarih seçiniz"),
})

export type ExpenseEntry = z.infer<typeof ExpenseEntrySchema>
export type IncomeEntry = z.infer<typeof IncomeEntrySchema>

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
]

export const incomeCategories = ["Satış Geliri", "Hizmet Geliri", "Faiz Geliri", "Kira Geliri", "Diğer Gelirler"]
