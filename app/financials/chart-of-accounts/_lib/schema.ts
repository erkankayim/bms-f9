import { z } from "zod"

export const accountTypes = ["asset", "liability", "equity", "revenue", "expense"] as const

export const accountFormSchema = z.object({
  account_code: z
    .string()
    .min(1, "Kod zorunludur")
    .max(20)
    .regex(/^[A-Za-z0-9.-]+$/, "Kod yalnızca harf, rakam, nokta ve tire içerebilir"),
  account_name: z.string().min(1, "Ad zorunludur").max(255),
  account_type: z.enum(accountTypes, { errorMap: () => ({ message: "Geçerli bir tür seçin" }) }),
  parent_account_id: z
    .union([z.string().transform(Number), z.number(), z.null(), z.undefined()])
    .nullable()
    .optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

export type AccountFormData = z.infer<typeof accountFormSchema>

/*  ------  Legacy export names (eski kod uyumu)  ------ */
export { accountFormSchema as AccountSchema }
