import { z } from "zod"

// Payment methods
export const PAYMENT_METHODS: string[] = ["Nakit", "Kredi Kartı", "Banka Transferi", "Çek", "Senet", "Diğer"]

// Zod Schemas
export const IncomeEntrySchema = z.object({
  description: z.string().min(3, "Açıklama en az 3 karakter olmalıdır."),
  incoming_amount: z.coerce.number().positive("Gelen tutar pozitif bir değer olmalıdır."),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih formatı girin (YYYY-AA-GG)."),
  category_id: z.coerce.number().positive("Kategori seçimi zorunludur."),
  source: z.string().min(2, "Gelir kaynağı en az 2 karakter olmalıdır."),
  customer_id: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      // Transform "no-customer", empty string, or undefined to null
      if (!val || val === "" || val === "no-customer" || val === "none") return null
      return val
    })
    .refine(
      (val) => {
        // Allow null values (optional)
        if (val === null || val === undefined) return true
        // If a value is provided, it can be either UUID or MID format (CUST-XXX)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        const midRegex = /^CUST-\d+/i // CUST- ile başlayan formatı kabul et
        return uuidRegex.test(val) || midRegex.test(val)
      },
      { message: "Geçerli bir müşteri seçin veya boş bırakın." },
    ),
  invoice_number: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null
      return val
    }),
  payment_method: z
    .string()
    .min(1, "Ödeme şekli seçimi zorunludur.")
    .refine((val) => PAYMENT_METHODS.includes(val), { message: "Geçersiz ödeme şekli." }),
  notes: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null
      return val
    }),
})

export const ExpenseEntrySchema = z.object({
  description: z.string().min(3, "Açıklama en az 3 karakter olmalıdır."),
  expense_amount: z.coerce.number().positive("Gider tutarı pozitif bir değer olmalıdır."),
  payment_amount: z.coerce.number().positive("Ödeme tutarı pozitif bir değer olmalıdır."),
  expense_title: z.string().min(2, "Gider başlığı en az 2 karakter olmalıdır."),
  expense_source: z.string().min(2, "Gider kaynağı en az 2 karakter olmalıdır."),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih formatı girin (YYYY-AA-GG)."),
  category_id: z.coerce.number().positive("Kategori seçimi zorunludur."),
  supplier_id: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      // Transform "no-supplier", empty string, or undefined to null
      if (!val || val === "" || val === "no-supplier" || val === "none") return null
      return val
    })
    .refine(
      (val) => {
        // Allow null values (optional)
        if (val === null || val === undefined) return true
        // If a value is provided, it must be a valid UUID (suppliers use UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return uuidRegex.test(val)
      },
      { message: "Geçerli bir tedarikçi seçin veya boş bırakın." },
    ),
  invoice_number: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null
      return val
    }),
  payment_method: z
    .string()
    .min(1, "Ödeme şekli seçimi zorunludur.")
    .refine((val) => PAYMENT_METHODS.includes(val), { message: "Geçersiz ödeme şekli." }),
  receipt_url: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null
      return val
    })
    .refine(
      (val) => {
        if (val === null || val === undefined) return true
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: "Geçerli bir URL girin." },
    ),
  notes: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null
      return val
    }),
})
