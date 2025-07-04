"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const expenseEntrySchema = z.object({
  expense_amount: z.coerce
    .number({ required_error: "Gider tutarı zorunludur." })
    .positive("Gider tutarı pozitif olmalıdır."),
  payment_amount: z.coerce
    .number({ required_error: "Ödenen tutar zorunludur." })
    .nonnegative("Ödenen tutar negatif olamaz."),
  entry_date: z.string().min(1, "Tarih gereklidir."),
  category_id: z.coerce.number().int().positive("Kategori seçimi gereklidir."),
  supplier_id: z.string().optional().nullable(),
  expense_title: z.string().min(1, "Gider başlığı gereklidir."),
  expense_source: z.string().min(1, "Gider kaynağı gereklidir."),
  description: z.string().min(1, "Açıklama gereklidir."),
  invoice_number: z.string().optional().nullable(),
  payment_method: z.string().min(1, "Ödeme şekli gereklidir."),
  notes: z.string().optional().nullable(),
})

export async function getExpenseEntries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("expense_entries")
    .select(`*, financial_categories(name), suppliers(name)`)
    .order("entry_date", { ascending: false })

  if (error) {
    console.error("Error fetching expense entries:", error)
    throw new Error("Gider kayıtları alınamadı.")
  }
  return data
}

export async function createExpenseEntryAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  const rawData = {
    ...Object.fromEntries(formData.entries()),
    supplier_id: formData.get("supplier_id") === "no-supplier" ? null : formData.get("supplier_id"),
  }

  const validatedFields = expenseEntrySchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Form verileri geçersiz.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase.from("expense_entries").insert(validatedFields.data)

  if (error) {
    return { success: false, message: `Veritabanı hatası: ${error.message}`, errors: null }
  }

  revalidatePath("/financials/expenses")
  return { success: true, message: "Gider başarıyla eklendi." }
}

export async function deleteExpense(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("expense_entries").delete().eq("id", id)
  if (error) {
    throw new Error("Gider kaydı silinemedi")
  }
  revalidatePath("/financials/expenses")
}
