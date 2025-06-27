import { z } from "zod"

export const accountTypes = [
  { value: "Varlık", label: "Varlık" },
  { value: "Yükümlülük", label: "Yükümlülük" },
  { value: "Özkaynak", label: "Özkaynak" },
  { value: "Gelir", label: "Gelir" },
  { value: "Gider", label: "Gider" },
  { value: "Satılan Malın Maliyeti", label: "Satılan Malın Maliyeti" },
]

export const AccountSchema = z.object({
  code: z
    .string()
    .min(1, "Hesap kodu gereklidir")
    .max(20, "Hesap kodu en fazla 20 karakter olabilir")
    .regex(/^[A-Za-z0-9.-]+$/, "Hesap kodu sadece harf, rakam, nokta ve tire içerebilir"),

  name: z.string().min(1, "Hesap adı gereklidir").max(255, "Hesap adı en fazla 255 karakter olabilir"),

  type: z.enum(["Varlık", "Yükümlülük", "Özkaynak", "Gelir", "Gider", "Satılan Malın Maliyeti"], {
    errorMap: () => ({ message: "Geçerli bir hesap türü seçin" }),
  }),

  parent_id: z
    .union([z.string().uuid("Geçerli bir üst hesap seçin"), z.null(), z.undefined(), z.literal("")])
    .transform((val) => {
      if (!val || val === "" || val === "none") return null
      return val
    })
    .optional(),

  description: z
    .union([z.string(), z.null(), z.undefined(), z.literal("")])
    .transform((val) => {
      if (!val || val === "") return null
      return val
    })
    .optional(),
})

export type AccountFormData = z.infer<typeof AccountSchema>
