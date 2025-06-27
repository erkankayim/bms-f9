import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { accountSchema, type AccountFormValues, type AccountType } from "../_lib/schema"

/* ---------------------------------------------------------- */
/* TİPLER                                                     */
/* ---------------------------------------------------------- */
export type ChartOfAccount = {
  id: number
  account_code: string
  account_name: string
  account_type: AccountType
  parent_account_id: number | null
  description: string | null
  is_active: boolean
  created_at: string
}

/* ---------------------------------------------------------- */
/* OKUMA İŞLEVLERİ (server componentlerde kullanılabilir)      */
/* ---------------------------------------------------------- */
export async function getAccountById(id: number) {
  "use server"
  const supabase = createClient()
  const { data, error } = await supabase.from("chart_of_accounts").select("*").eq("id", id).single()
  if (error) throw error
  return data as ChartOfAccount
}

export async function getChartOfAccounts({
  searchTerm,
  accountType,
}: {
  searchTerm?: string
  accountType?: string
}) {
  "use server"
  const supabase = createClient()
  let q = supabase
    .from("chart_of_accounts")
    .select("*, parent_account:chart_of_accounts!parent_account_id(id,account_code,account_name)")
    .order("account_code")

  if (searchTerm) q = q.or(`account_code.ilike.%${searchTerm}%,account_name.ilike.%${searchTerm}%`)
  if (accountType && accountType !== "All") q = q.eq("account_type", accountType)

  const { data, error } = await q
  if (error) throw error
  return data as ChartOfAccount[]
}

/* ---------------------------------------------------------- */
/* MUTASYONLAR — SERVER ACTION                                */
/* ---------------------------------------------------------- */
export async function addAccountAction(values: AccountFormValues) {
  "use server"
  const parsed = accountSchema.safeParse(values)
  if (!parsed.success) return { success: false, errors: parsed.error.issues as any }

  const supabase = createClient()

  const { error } = await supabase.from("chart_of_accounts").insert(parsed.data)
  if (error)
    return {
      success: false,
      message: error.code === "23505" ? "Bu hesap kodu zaten kullanılıyor." : error.message,
    }

  revalidatePath("/financials/chart-of-accounts")
  return { success: true }
}

export async function updateAccountAction(id: number, values: AccountFormValues) {
  "use server"
  const parsed = accountSchema.safeParse(values)
  if (!parsed.success) return { success: false, errors: parsed.error.issues as any }

  const supabase = createClient()
  const { error } = await supabase.from("chart_of_accounts").update(parsed.data).eq("id", id)

  if (error)
    return {
      success: false,
      message: error.code === "23505" ? "Bu hesap kodu zaten kullanılıyor." : error.message,
    }

  revalidatePath("/financials/chart-of-accounts")
  return { success: true }
}

export async function deleteAccountAction(id: number) {
  "use server"
  const supabase = createClient()
  const { error } = await supabase.from("chart_of_accounts").delete().eq("id", id)
  if (error) return { success: false, message: error.message }
  revalidatePath("/financials/chart-of-accounts")
  return { success: true }
}

export async function toggleAccountStatusAction(id: number, isActive: boolean) {
  "use server"
  const supabase = createClient()
  const { error } = await supabase.from("chart_of_accounts").update({ is_active: isActive }).eq("id", id)
  if (error) return { success: false, message: error.message }
  revalidatePath("/financials/chart-of-accounts")
  return { success: true }
}
