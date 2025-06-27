"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

export interface IncomeEntry {
  id: string
  description: string
  amount: number
  date: string
  customer_name?: string
  account_name?: string
}

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
      incoming_amount: validatedFields.data.amount,
      entry_date: validatedFields.data.date,
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

export async function getIncomeEntries(): Promise<IncomeEntry[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        description,
        incoming_amount,
        entry_date,
        customers!customer_id(name),
        chart_of_accounts!account_id(account_name)
      `)
      .gt("incoming_amount", 0)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Error fetching income entries:", error)
      return []
    }

    return (data || []).map((entry: any) => ({
      id: entry.id,
      description: entry.description,
      amount: entry.incoming_amount,
      date: entry.entry_date,
      customer_name: entry.customers?.name,
      account_name: entry.chart_of_accounts?.account_name,
    }))
  } catch (error) {
    console.error("Error in getIncomeEntries:", error)
    return []
  }
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
      id,
      description,
      incoming_amount,
      entry_date,
      customers!customer_id(name),
      chart_of_accounts!account_id(account_name)
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
    id: data.id,
    description: data.description,
    amount: data.incoming_amount,
    date: data.entry_date,
    customer_name: data.customers?.name,
    account_name: data.chart_of_accounts?.account_name,
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
      incoming_amount: validatedFields.data.amount,
      entry_date: validatedFields.data.date,
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
  try {
    const supabase = createClient()

    const { error } = await supabase.from("financial_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting income entry:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/financials/income")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteIncomeEntry:", error)
    return { success: false, error: "Silme işlemi başarısız" }
  }
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
