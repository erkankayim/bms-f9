import { z } from "zod"

export const AccountSchema = z.object({
  account_code: z.string().min(1, "Hesap kodu gereklidir"),
  account_name: z.string().min(1, "Hesap adı gereklidir"),
  account_type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"], {
    required_error: "Hesap türü seçilmelidir",
  }),
  parent_account_id: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type AccountFormData = z.infer<typeof AccountSchema>
