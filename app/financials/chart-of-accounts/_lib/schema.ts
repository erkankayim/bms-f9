import { z } from "zod"

export const accountTypes = [
  { value: "Varlık", label: "Varlık" },
  { value: "Yükümlülük", label: "Yükümlülük" },
  { value: "Özkaynak", label: "Özkaynak" },
  { value: "Gelir", label: "Gelir" },
  { value: "Gider", label: "Gider" },
  { value: "Satılan Malın Maliyeti", label: "Satılan Malın Maliyeti" },
] as const

export const accountFormSchema = z.object({
  code: z.string().min(1, "Hesap kodu gereklidir"),
  name: z.string().min(1, "Hesap adı gereklidir"),
  type: z.enum(["Varlık", "Yükümlülük", "Özkaynak", "Gelir", "Gider", "Satılan Malın Maliyeti"]),
  parent_id: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type AccountFormData = z.infer<typeof accountFormSchema>

// Legacy export for backward compatibility
export const AccountSchema = accountFormSchema
