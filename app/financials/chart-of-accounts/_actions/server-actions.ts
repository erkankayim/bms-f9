"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { z } from "zod"
import type { AccountSchema } from "../_lib/schema"

type AccountInput = z.infer<typeof AccountSchema>

export async function addAccountAction(data: AccountInput) {
  const supabase = await createClient()

  const { error } = await supabase.from("chart_of_accounts").insert({
    account_code: data.account_code,
    account_name: data.account_name,
    account_type: data.account_type,
    parent_account_id: data.parent_account_id || null,
    description: data.description || null,
    is_active: data.is_active ?? true,
  })

  if (error) {
    throw new Error(`Hesap eklenirken hata oluştu: ${error.message}`)
  }

  revalidatePath("/financials/chart-of-accounts")
  redirect("/financials/chart-of-accounts")
}

export async function updateAccountAction(id: string, data: AccountInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("chart_of_accounts")
    .update({
      account_code: data.account_code,
      account_name: data.account_name,
      account_type: data.account_type,
      parent_account_id: data.parent_account_id || null,
      description: data.description || null,
      is_active: data.is_active ?? true,
    })
    .eq("id", id)

  if (error) {
    throw new Error(`Hesap güncellenirken hata oluştu: ${error.message}`)
  }

  revalidatePath("/financials/chart-of-accounts")
  redirect("/financials/chart-of-accounts")
}

export async function toggleAccountStatusAction(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from("chart_of_accounts").update({ is_active: isActive }).eq("id", id)

  if (error) {
    throw new Error(`Hesap durumu değiştirilirken hata oluştu: ${error.message}`)
  }

  revalidatePath("/financials/chart-of-accounts")
}

export async function deleteAccountAction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("chart_of_accounts").delete().eq("id", id)

  if (error) {
    throw new Error(`Hesap silinirken hata oluştu: ${error.message}`)
  }

  revalidatePath("/financials/chart-of-accounts")
}

export async function getAccountById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("chart_of_accounts").select("*").eq("id", id).single()

  if (error) {
    throw new Error(`Hesap getirilirken hata oluştu: ${error.message}`)
  }

  return data
}
