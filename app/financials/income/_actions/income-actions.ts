"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const incomeSchema = z.object({
  description: z.string().min(1, "Açıklama gereklidir"),
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  date: z.string().min(1, "Tarih gereklidir"),
  customer_id: z.string().nullable().optional(),
  account_id: z.string().min(1, "Hesap seçimi gereklidir"),
})

export async function createIncomeEntry(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const validatedFields = incomeSchema.safeParse({
    description: formData.get("description"),
    amount: Number(formData.get("amount")),
    date: formData.get("date"),
    customer_id: formData.get("customer_id") || null,
    account_id: formData.get("account_id"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { data, error } = await supabase
    .from("financial_entries")
    .insert({
      type: "income",
      description: validatedFields.data.description,
      amount: validatedFields.data.amount,
      date: validatedFields.data.date,
      customer_id: validatedFields.data.customer_id,
      account_id: validatedFields.data.account_id,
      user_id: user.id,
    })
    .select()

  if (error) {
    return {
      errors: {
        _form: ["Gelir kaydı oluşturulurken bir hata oluştu"],
      },
    }
  }

  revalidatePath("/financials/income")
  redirect("/financials/income")
}

export async function getIncomeEntries() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("financial_entries")
    .select(`
      *,
      customers!financial_entries_customer_id_fkey(name),
      chart_of_accounts!financial_entries_account_id_fkey(name)
    `)
    .eq("type", "income")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching income entries:", error)
    return []
  }

  return data.map((entry) => ({
    ...entry,
    customer_name: entry.customers?.name || null,
    account_name: entry.chart_of_accounts?.name || null,
  }))
}

export async function getIncomeEntry(id: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("financial_entries")
    .select(`
      *,
      customers!financial_entries_customer_id_fkey(name),
      chart_of_accounts!financial_entries_account_id_fkey(name)
    `)
    .eq("id", id)
    .eq("type", "income")
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching income entry:", error)
    return null
  }

  return {
    ...data,
    customer_name: data.customers?.name || null,
    account_name: data.chart_of_accounts?.name || null,
  }
}

export async function updateIncomeEntry(id: string, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const validatedFields = incomeSchema.safeParse({
    description: formData.get("description"),
    amount: Number(formData.get("amount")),
    date: formData.get("date"),
    customer_id: formData.get("customer_id") || null,
    account_id: formData.get("account_id"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase
    .from("financial_entries")
    .update({
      description: validatedFields.data.description,
      amount: validatedFields.data.amount,
      date: validatedFields.data.date,
      customer_id: validatedFields.data.customer_id,
      account_id: validatedFields.data.account_id,
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return {
      errors: {
        _form: ["Gelir kaydı güncellenirken bir hata oluştu"],
      },
    }
  }

  revalidatePath("/financials/income")
  redirect("/financials/income")
}

export async function deleteIncomeEntry(id: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { error } = await supabase.from("financial_entries").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    return {
      errors: {
        _form: ["Gelir kaydı silinirken bir hata oluştu"],
      },
    }
  }

  revalidatePath("/financials/income")
  return { success: true }
}

export async function getCustomersForDropdown() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase.from("customers").select("mid, name").eq("user_id", user.id).order("name")

  if (error) {
    console.error("Error fetching customers:", error)
    return []
  }

  return data
}

export async function getAccountsForDropdown() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("chart_of_accounts")
    .select("id, name, code")
    .eq("user_id", user.id)
    .order("code")

  if (error) {
    console.error("Error fetching accounts:", error)
    return []
  }

  return data
}
