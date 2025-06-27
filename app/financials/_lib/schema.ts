import { z } from "zod"

export const PAYMENT_METHODS = ["Nakit", "Kredi Kartı", "Banka Transferi", "Çek", "Senet", "Diğer"] as const

export const IncomeFormSchema = z.object({
  description: z.string().min(2, "Açıklama en az 2 karakter olmalıdır."),
  incoming_amount: z.coerce.number().positive("Tutar pozitif bir sayı olmalıdır."),
  entry_date: z.string().min(1, "Tarih gereklidir."),
  category_id: z.coerce.number().positive("Kategori seçimi zorunludur."),
  customer_id: z.string().optional().nullable(),
  payment_method: z.enum(PAYMENT_METHODS),
  notes: z.string().optional(),
})

export const ExpenseFormSchema = z.object({
  expense_title: z.string().min(2, "Gider başlığı en az 2 karakter olmalıdır."),
  expense_amount: z.coerce.number().positive("Gider tutarı pozitif bir sayı olmalıdır."),
  payment_amount: z.coerce.number().min(0, "Ödeme tutarı negatif olamaz."),
  entry_date: z.string().min(1, "Tarih gereklidir."),
  category_id: z.coerce.number().positive("Kategori seçimi zorunludur."),
  supplier_id: z.string().optional().nullable(),
  payment_method: z.enum(PAYMENT_METHODS),
  notes: z.string().optional(),
})

export type IncomeFormData = z.infer<typeof IncomeFormSchema>
export type ExpenseFormData = z.infer<typeof ExpenseFormSchema>
