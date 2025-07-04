"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const incomeSchema = z.object({
  description: z.string().min(1, "Açıklama gereklidir"),
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  category: z.string().min(1, "Kategori seçimi gereklidir"),
  date: z.string().min(1, "Tarih gereklidir"),
  notes: z.string().optional(),
})

export async function createIncome(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Kullanıcı yetkilendirmesi başarısız")
  }

  const validatedFields = incomeSchema.safeParse({
    description: formData.get("description"),
    amount: Number(formData.get("amount")),
    category: formData.get("category"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  })

  if (!validatedFields.success) {
    throw new Error("Form verileri geçersiz")
  }

  const { description, amount, category, date, notes } = validatedFields.data

  const { error } = await supabase.from("financial_entries").insert({
    type: "income",
    description,
    amount,
    category,
    date,
    notes,
    user_id: user.id,
  })

  if (error) {
    throw new Error("Gelir kaydı oluşturulamadı")
  }

  revalidatePath("/financials/income")
  redirect("/financials/income")
}

export async function updateIncome(id: string, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Kullanıcı yetkilendirmesi başarısız")
  }

  const validatedFields = incomeSchema.safeParse({
    description: formData.get("description"),
    amount: Number(formData.get("amount")),
    category: formData.get("category"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  })

  if (!validatedFields.success) {
    throw new Error("Form verileri geçersiz")
  }

  const { description, amount, category, date, notes } = validatedFields.data

  const { error } = await supabase
    .from("financial_entries")
    .update({
      description,
      amount,
      category,
      date,
      notes,
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    throw new Error("Gelir kaydı güncellenemedi")
  }

  revalidatePath("/financials/income")
  redirect("/financials/income")
}

export async function deleteIncome(id: string) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Kullanıcı yetkilendirmesi başarısız")
  }

  const { error } = await supabase.from("financial_entries").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    throw new Error("Gelir kaydı silinemedi")
  }

  revalidatePath("/financials/income")
}
