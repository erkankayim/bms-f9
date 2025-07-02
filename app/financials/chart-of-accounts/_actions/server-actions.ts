"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath, redirect } from "next/cache"
import type { AccountFormData } from "../_lib/schema"

/* ----------  HELPERS  ---------- */

async function supabase() {
  return createClient()
}

/* ----------  QUERIES  ---------- */

export async function getChartOfAccounts() {
  const db = await supabase()
  try {
    const { data, error } = await db.from("chart_of_accounts").select("*").order("account_code", { ascending: true })

    if (error) throw error
    return { data: data ?? [] }
  } catch (err: any) {
    console.error("getChartOfAccounts:", err)
    return { error: err.message || "Hesap planı alınamadı" }
  }
}

export async function getAccountById(id: string) {
  const db = await supabase()
  try {
    const { data, error } = await db.from("chart_of_accounts").select("*").eq("id", id).single()
    if (error) throw error
    return { data }
  } catch (err: any) {
    console.error("getAccountById:", err)
    return { error: err.message || "Hesap bulunamadı" }
  }
}

/* ----------  MUTATIONS  ---------- */

export async function addAccountAction(form: AccountFormData) {
  const db = await supabase()
  try {
    const { error } = await db.from("chart_of_accounts").insert({
      account_code: form.account_code,
      account_name: form.account_name,
      account_type: form.account_type,
      parent_account_id: form.parent_account_id ?? null,
      description: form.description ?? null,
      is_active: form.is_active ?? true,
    })
    if (error) throw error
    revalidatePath("/financials/chart-of-accounts")
    redirect("/financials/chart-of-accounts")
  } catch (err: any) {
    throw new Error(err.message || "Hesap eklenirken hata oluştu")
  }
}

export async function updateAccountAction(id: string, form: AccountFormData) {
  const db = await supabase()
  try {
    const { error } = await db
      .from("chart_of_accounts")
      .update({
        account_code: form.account_code,
        account_name: form.account_name,
        account_type: form.account_type,
        parent_account_id: form.parent_account_id ?? null,
        description: form.description ?? null,
        is_active: form.is_active ?? true,
      })
      .eq("id", id)

    if (error) throw error
    revalidatePath("/financials/chart-of-accounts")
    redirect("/financials/chart-of-accounts")
  } catch (err: any) {
    throw new Error(err.message || "Hesap güncellenirken hata oluştu")
  }
}

export async function toggleAccountStatusAction(id: string, isActive: boolean) {
  const db = await supabase()
  try {
    const { error } = await db.from("chart_of_accounts").update({ is_active: isActive }).eq("id", id)
    if (error) throw error
    revalidatePath("/financials/chart-of-accounts")
  } catch (err: any) {
    throw new Error(err.message || "Hesap durumu değiştirilirken hata oluştu")
  }
}

export async function deleteAccountAction(id: string) {
  const db = await supabase()
  try {
    const { error } = await db.from("chart_of_accounts").delete().eq("id", id)
    if (error) throw error
    revalidatePath("/financials/chart-of-accounts")
  } catch (err: any) {
    throw new Error(err.message || "Hesap silinirken hata oluştu")
  }
}
