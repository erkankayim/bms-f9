import { z } from "zod"

// Ödeme yöntemleri
export const PAYMENT_METHODS = [
  { value: "cash", label: "Nakit" },
  { value: "credit_card", label: "Kredi Kartı" },
  { value: "debit_card", label: "Banka Kartı" },
  { value: "bank_transfer", label: "Banka Havalesi" },
  { value: "check", label: "Çek" },
  { value: "other", label: "Diğer" },
] as const

// Gider kategorileri
export const expenseCategories = [
  { value: "office_supplies", label: "Ofis Malzemeleri" },
  { value: "rent", label: "Kira" },
  { value: "utilities", label: "Faturalar (Elektrik, Su, Gaz)" },
  { value: "marketing", label: "Pazarlama" },
  { value: "travel", label: "Seyahat" },
  { value: "meals", label: "Yemek" },
  { value: "equipment", label: "Ekipman" },
  { value: "software", label: "Yazılım" },
  { value: "insurance", label: "Sigorta" },
  { value: "legal", label: "Hukuki" },
  { value: "accounting", label: "Muhasebe" },
  { value: "maintenance", label: "Bakım" },
  { value: "fuel", label: "Yakıt" },
  { value: "other", label: "Diğer" },
] as const

// Gelir kategorileri
export const incomeCategories = [
  { value: "sales", label: "Satış Geliri" },
  { value: "service", label: "Hizmet Geliri" },
  { value: "interest", label: "Faiz Geliri" },
  { value: "rental", label: "Kira Geliri" },
  { value: "commission", label: "Komisyon" },
  { value: "consulting", label: "Danışmanlık" },
  { value: "other", label: "Diğer" },
] as const

// Gider girişi şeması
export const ExpenseEntrySchema = z.object({
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  description: z.string().min(1, "Açıklama gereklidir"),
  category: z.string().min(1, "Kategori seçilmelidir"),
  payment_method: z.string().min(1, "Ödeme yöntemi seçilmelidir"),
  supplier_id: z.string().optional(),
  date: z.string().min(1, "Tarih gereklidir"),
})

// Gelir girişi şeması
export const IncomeEntrySchema = z.object({
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  description: z.string().min(1, "Açıklama gereklidir"),
  category: z.string().min(1, "Kategori seçilmelidir"),
  payment_method: z.string().min(1, "Ödeme yöntemi seçilmelidir"),
  customer_id: z.string().optional(),
  date: z.string().min(1, "Tarih gereklidir"),
})

export type ExpenseEntry = z.infer<typeof ExpenseEntrySchema>
export type IncomeEntry = z.infer<typeof IncomeEntrySchema>
