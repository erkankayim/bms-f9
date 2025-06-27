import { z } from "zod"

/** Allowed account categories */
export const accountTypes = ["Asset", "Liability", "Equity", "Revenue", "Expense", "Cost of Goods Sold"] as const
export type AccountType = (typeof accountTypes)[number]

/** Zod validation for both client & server */
export const accountSchema = z.object({
  account_code: z.string().min(1, "Hesap kodu gereklidir.").max(20, "Hesap kodu en fazla 20 karakter olabilir."),
  account_name: z.string().min(1, "Hesap adı gereklidir.").max(255),
  account_type: z.enum(accountTypes, {
    errorMap: () => ({ message: "Geçerli bir hesap türü seçin." }),
  }),
  parent_account_id: z.coerce.number().int().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

export type AccountFormValues = z.infer<typeof accountSchema>

// Alias for legacy imports
export { accountSchema as AccountSchema }
