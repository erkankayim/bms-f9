"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { AccountSchema } from "../_lib/schema"
import type { z } from "zod"

export type Account = {
  id: number
  code: string
  name: string
  type: string
  parent_id?: number | null
  description?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getChartOfAccounts({
  searchTerm = "",
  accountType = "All",
  page = 1,
  pageSize = 10,
}: {
  searchTerm?: string
  accountType?: string
  page?: number
  pageSize?: number
}) {
  const supabase = createClient()

  try {
    let query = supabase.from("chart_of_accounts").select("*", { count: "exact" })

    if (searchTerm) {
      query = query.or(`code.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
    }

    if (accountType !== "All") {
      query = query.eq("type", accountType)
    }

    const { data, error, count } = await query.order("code").range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      console.error("Chart of accounts query error:", error)
      // Return empty results instead of throwing
      return { accounts: [], count: 0 }
    }

    return { accounts: data || [], count: count || 0 }
  } catch (error) {
    console.error("Chart of accounts error:", error)
    return { accounts: [], count: 0 }
  }
}

export async function createAccount(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const supabase = createClient()
  const rawData = Object.fromEntries(formData)

  if (rawData.parent_id === "none" || rawData.parent_id === "") {
    rawData.parent_id = null
  }

  const validatedFields = AccountSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Lütfen formdaki hataları düzeltin.",
      errors: validatedFields.error.issues,
    }
  }

  const { code, name, type, parent_id, description } = validatedFields.data

  const { error } = await supabase.from("chart_of_accounts").insert({
    code,
    name,
    type,
    parent_id: parent_id || null,
    description: description || null,
    is_active: true,
  })

  if (error) {
    console.error("Account creation error:", error)
    return { success: false, message: `Hesap oluşturulurken hata: ${error.message}` }
  }

  revalidatePath("/financials/chart-of-accounts")
  return { success: true, message: "Hesap başarıyla oluşturuldu." }
}

export async function updateAccount(
  id: number,
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  const supabase = createClient()
  const rawData = Object.fromEntries(formData)

  if (rawData.parent_id === "none" || rawData.parent_id === "") {
    rawData.parent_id = null
  }

  const validatedFields = AccountSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Lütfen formdaki hataları düzeltin.",
      errors: validatedFields.error.issues,
    }
  }

  const { code, name, type, parent_id, description } = validatedFields.data

  const { error } = await supabase
    .from("chart_of_accounts")
    .update({
      code,
      name,
      type,
      parent_id: parent_id || null,
      description: description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Account update error:", error)
    return { success: false, message: `Hesap güncellenirken hata: ${error.message}` }
  }

  revalidatePath("/financials/chart-of-accounts")
  return { success: true, message: "Hesap başarıyla güncellendi." }
}

export async function deleteAccount(id: number): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()

  const { error } = await supabase.from("chart_of_accounts").delete().eq("id", id)

  if (error) {
    console.error("Account deletion error:", error)
    return { success: false, message: `Hesap silinirken hata: ${error.message}` }
  }

  revalidatePath("/financials/chart-of-accounts")
  return { success: true, message: "Hesap başarıyla silindi." }
}

export async function toggleAccountStatus(
  id: number,
  isActive: boolean,
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()

  const { error } = await supabase.from("chart_of_accounts").update({ is_active: isActive }).eq("id", id)

  if (error) {
    console.error("Account status toggle error:", error)
    return { success: false, message: `Hesap durumu değiştirilirken hata: ${error.message}` }
  }

  revalidatePath("/financials/chart-of-accounts")
  return { success: true, message: `Hesap ${isActive ? "aktif" : "pasif"} hale getirildi.` }
}

export async function getAccount(id: number): Promise<Account | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("chart_of_accounts").select("*").eq("id", id).single()

    if (error) {
      console.error("Get account error:", error)
      return null
    }

    return data as Account
  } catch (error) {
    console.error("Get account error:", error)
    return null
  }
}

export async function getParentAccounts(): Promise<Account[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("chart_of_accounts")
      .select("*")
      .is("parent_id", null)
      .eq("is_active", true)
      .order("code")

    if (error) {
      console.error("Get parent accounts error:", error)
      return []
    }

    return data as Account[]
  } catch (error) {
    console.error("Get parent accounts error:", error)
    return []
  }
}
