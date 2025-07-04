"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const incomeEntrySchema = z.object({
  incoming_amount: z.coerce
    .number({ required_error: "Gelen tutar zorunludur." })
    .positive("Gelen tutar pozitif olmalıdır."),
  entry_date: z.string().min(1, "Tarih gereklidir."),
  category_id: z.coerce.number().int().positive("Kategori seçimi gereklidir."),
  customer_id: z.string().optional().nullable(),
  source: z.string().min(1, "Gelir kaynağı gereklidir."),
  description: z.string().min(1, "Açıklama gereklidir."),
  invoice_number: z.string().optional().nullable(),
  payment_method: z.string().min(1, "Ödeme şekli gereklidir."),
  notes: z.string().optional().nullable(),
})

export async function getIncomeEntries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("income_entries")
    .select(`*, financial_categories(name), customers(contact_name)`)
    .order("entry_date", { ascending: false })

  if (error) {
    console.error("Error fetching income entries:", error)
    throw new Error("Gelir kayıtları alınamadı.")
  }
  return data
}

export async function createIncomeEntryAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  const rawData = {
    ...Object.fromEntries(formData.entries()),
    customer_id: formData.get("customer_id") === "no-customer" ? null : formData.get("customer_id"),
  }

  const validatedFields = incomeEntrySchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Form verileri geçersiz.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase.from("income_entries").insert(validatedFields.data)

  if (error) {
    return { success: false, message: `Veritabanı hatası: ${error.message}`, errors: null }
  }

  revalidatePath("/financials/income")
  return { success: true, message: "Gelir başarıyla eklendi." }
}

export async function deleteIncome(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("income_entries").delete().eq("id", id)
  if (error) {
    throw new Error("Gelir kaydı silinemedi")
  }
  revalidatePath("/financials/income")
}

// ----- Ortak yardımcıları yeniden dışa aktar -----
export { getFinancialCategories, getCustomersForDropdown } from "../../_actions/financial-entries-actions"
