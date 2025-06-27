import { z } from "zod"

export const PAYMENT_METHODS = ["Nakit", "Kredi Kartı", "Banka Transferi", "Çek", "Senet", "Diğer"] as const

// MID format regex for customer IDs like CUST-004
const midRegex = /^CUST-\d{3}$/
// UUID format regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const IncomeEntrySchema = z.object({
  id: z.number().optional(),
  description: z.string().min(1, "Açıklama gereklidir"),
  incoming_amount: z.coerce.number().positive("Tutar pozitif olmalıdır"),
  entry_date: z.string().min(1, "Tarih gereklidir"),
  category_id: z.coerce.number().positive("Kategori seçilmelidir"),
  source: z.string().min(1, "Kaynak gereklidir"),
  customer_id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val === "no-customer" || val === "") return null
      return val
    })
    .refine((val) => {
      if (val === null) return true
      return midRegex.test(val) || uuidRegex.test(val)
    }, "Geçerli bir müşteri seçin veya boş bırakın"),
  invoice_number: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  payment_method: z.enum(PAYMENT_METHODS, {
    required_error: "Ödeme yöntemi seçilmelidir",
  }),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
})

export const ExpenseEntrySchema = z.object({
  id: z.number().optional(),
  description: z.string().min(1, "Açıklama gereklidir"),
  expense_amount: z.coerce.number().positive("Gider tutarı pozitif olmalıdır"),
  payment_amount: z.coerce.number().positive("Ödeme tutarı pozitif olmalıdır"),
  expense_title: z.string().min(1, "Gider başlığı gereklidir"),
  expense_source: z.string().min(1, "Gider kaynağı gereklidir"),
  entry_date: z.string().min(1, "Tarih gereklidir"),
  category_id: z.coerce.number().positive("Kategori seçilmelidir"),
  supplier_id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val === "no-supplier" || val === "") return null
      return val
    }),
  invoice_number: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  payment_method: z.enum(PAYMENT_METHODS, {
    required_error: "Ödeme yöntemi seçilmelidir",
  }),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
})

export type IncomeEntryFormData = z.infer<typeof IncomeEntrySchema>
export type ExpenseEntryFormData = z.infer<typeof ExpenseEntrySchema>
