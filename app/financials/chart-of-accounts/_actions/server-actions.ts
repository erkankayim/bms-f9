"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { AccountSchema } from "../_lib/schema"
import type { z } from "zod"

type AccountFormData = z.infer<typeof AccountSchema>

/* ------------------------------------------------------------------ */
/*  GET - Chart of Accounts (used by list & table pages)              */
/* ------------------------------------------------------------------ */
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
      query = query.or(`account_code.ilike.%${searchTerm}%,account_name.ilike.%${searchTerm}%`)
    }

    if (accountType !== "All") {
      query = query.eq("account_type", accountType)
    }

    const { data, error, count } = await query.order("account_code").range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      console.error("Chart of accounts query error:", error)
      return { accounts: [], count: 0 }
    }

    return { accounts: data || [], count: count || 0 }
  } catch (err) {
    console.error("Chart of accounts error:", err)
    return { accounts: [], count: 0 }
  }
}

export async function addAccountAction(data: AccountFormData) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("chart_of_accounts").insert({
      account_code: data.account_code,
      account_name: data.account_name,
      account_type: data.account_type,
      parent_account_id: data.parent_account_id || null,
      description: data.description || null,
      is_active: data.is_active ?? true,
    })

    if (error) {
      console.error("Error adding account:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/financials/chart-of-accounts")
    return { success: true }
  } catch (error) {
    console.error("Error in addAccountAction:", error)
    return { success: false, error: "Hesap eklenirken bir hata oluştu" }
  }
}

export async function updateAccountAction(id: string, data: AccountFormData) {
  try {
    const supabase = createClient()

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
      console.error("Error updating account:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/financials/chart-of-accounts")
    return { success: true }
  } catch (error) {
    console.error("Error in updateAccountAction:", error)
    return { success: false, error: "Hesap güncellenirken bir hata oluştu" }
  }
}

export async function toggleAccountStatusAction(id: string, isActive: boolean) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("chart_of_accounts").update({ is_active: isActive }).eq("id", id)

    if (error) {
      console.error("Error toggling account status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/financials/chart-of-accounts")
    return { success: true }
  } catch (error) {
    console.error("Error in toggleAccountStatusAction:", error)
    return { success: false, error: "Hesap durumu değiştirilirken bir hata oluştu" }
  }
}

export async function deleteAccountAction(id: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("chart_of_accounts").delete().eq("id", id)

    if (error) {
      console.error("Error deleting account:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/financials/chart-of-accounts")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteAccountAction:", error)
    return { success: false, error: "Hesap silinirken bir hata oluştu" }
  }
}

export async function getAccountById(id: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("chart_of_accounts").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching account:", error)
      return { success: false, error: error.message, data: null }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getAccountById:", error)
    return { success: false, error: "Hesap getirilirken bir hata oluştu", data: null }
  }
}
