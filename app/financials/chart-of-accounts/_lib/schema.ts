import { z } from "zod"

export const accountTypes = [
  { value: "asset", label: "Varlık" },
  { value: "liability", label: "Borç" },
  { value: "equity", label: "Özkaynak" },
  { value: "revenue", label: "Gelir" },
  { value: "expense", label: "Gider" },
] as const

export const AccountSchema = z.object({
  code: z.string().min(1, "Hesap kodu gereklidir"),
  name: z.string().min(1, "Hesap adı gereklidir"),
  type: z.enum(["asset", "liability", "equity", "revenue", "expense"], {
    required_error: "Hesap türü seçilmelidir",
  }),
  parent_id: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
})

export type AccountFormData = z.infer<typeof AccountSchema>
