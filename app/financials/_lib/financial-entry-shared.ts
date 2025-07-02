import { z } from "zod"

export const PAYMENT_METHODS = ["Nakit", "Kredi Kartı", "Banka Transferi", "Çek", "Senet", "Diğer"] as const

export const incomeCategories = [
  { id: 1, name: "Ürün Satışları" },
  { id: 2, name: "Hizmet Gelirleri" },
  { id: 3, name: "Faiz Gelirleri" },
  { id: 4, name: "Diğer Gelirler" },
] as const

export const expenseCategories = [
  { id: 5, name: "Ofis Giderleri" },
  { id: 6, name: "Personel Giderleri" },
  { id: 7, name: "Malzeme Giderleri" },
  { id: 8, name: "Pazarlama Giderleri" },
  { id: 9, name: "Diğer Giderler" },
] as const

export const IncomeEntrySchema = z.object({
  description: z.string().min(1, "Açıklama gereklidir"),
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  entry_date: z.string().min(1, "Tarih gereklidir"),
  payment_method: z.enum(PAYMENT_METHODS),
  customer_id: z.string().optional(),
  category_id: z.number().optional(),
  notes: z.string().optional(),
})

export const ExpenseEntrySchema = z.object({
  description: z.string().min(1, "Açıklama gereklidir"),
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  entry_date: z.string().min(1, "Tarih gereklidir"),
  payment_method: z.enum(PAYMENT_METHODS),
  supplier_id: z.string().optional(),
  category_id: z.number().optional(),
  notes: z.string().optional(),
})

export type IncomeEntrySchema = z.infer<typeof IncomeEntrySchema>
export type ExpenseEntrySchema = z.infer<typeof ExpenseEntrySchema>
