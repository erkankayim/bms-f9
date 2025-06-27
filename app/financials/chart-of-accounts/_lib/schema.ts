import { z } from "zod"

/**
 * Hesap tipleri (Chart of Accounts)
 */
export const accountTypes = ["Asset", "Liability", "Equity", "Revenue", "Expense", "Cost of Goods Sold"] as const
export type AccountType = (typeof accountTypes)[number]

/**
 * Ana Zod şeması
 */
export const accountSchema = z.object({
  account_code: z.string().min(1, "Hesap kodu gereklidir.").max(20, "En fazla 20 karakter olabilir."),
  account_name: z.string().min(1, "Hesap adı gereklidir.").max(255, "En fazla 255 karakter olabilir."),
  account_type: z.enum(accountTypes, {
    errorMap: () => ({ message: "Geçerli bir hesap türü seçin." }),
  }),
  parent_account_id: z.coerce.number().int().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

/* Hem camelCase hem PascalCase isimle export edelim ki import
   uyuşmazlıkları çözülmüş olsun. */
export const AccountSchema = accountSchema

export type AccountFormValues = z.infer<typeof accountSchema>
