"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type Account = {
  id: string
  code: string
  name: string
  type: string
  parent_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getChartOfAccounts(): Promise<{ data?: Account[]; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("chart_of_accounts").select("*").order("code", { ascending: true })

    if (error) {
      console.error("Hesap planı alınırken hata:", error)
      return { error: `Hesap planı alınırken hata: ${error.message}` }
    }

    return { data: data || [] }
  } catch (error: any) {
    console.error("Hesap planı alınırken hata:", error)
    return { error: `Hesap planı alınırken hata: ${error.message}` }
  }
}

export async function getAccountById(id: string): Promise<{ data?: Account; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("chart_of_accounts").select("*").eq("id", id).single()

    if (error) {
      console.error("Hesap alınırken hata:", error)
      return { error: `Hesap alınırken hata: ${error.message}` }
    }

    return { data }
  } catch (error: any) {
    console.error("Hesap alınırken hata:", error)
    return { error: `Hesap alınırken hata: ${error.message}` }
  }
}

export async function addAccountAction(formData: FormData) {
  const supabase = createClient()

  try {
    const code = formData.get("code") as string
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const parentId = formData.get("parent_id") as string
    const description = formData.get("description") as string
    const isActive = formData.get("is_active") === "true"

    const { error } = await supabase.from("chart_of_accounts").insert([
      {
        code,
        name,
        type,
        parent_id: parentId || null,
        description: description || null,
        is_active: isActive,
      },
    ])

    if (error) {
      console.error("Hesap eklenirken hata:", error)
      throw new Error(`Hesap eklenirken hata: ${error.message}`)
    }

    revalidatePath("/financials/chart-of-accounts")
    redirect("/financials/chart-of-accounts")
  } catch (error: any) {
    console.error("Hesap eklenirken hata:", error)
    throw new Error(`Hesap eklenirken hata: ${error.message}`)
  }
}

export async function updateAccountAction(id: string, formData: FormData) {
  const supabase = createClient()

  try {
    const code = formData.get("code") as string
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const parentId = formData.get("parent_id") as string
    const description = formData.get("description") as string
    const isActive = formData.get("is_active") === "true"

    const { error } = await supabase
      .from("chart_of_accounts")
      .update({
        code,
        name,
        type,
        parent_id: parentId || null,
        description: description || null,
        is_active: isActive,
      })
      .eq("id", id)

    if (error) {
      console.error("Hesap güncellenirken hata:", error)
      throw new Error(`Hesap güncellenirken hata: ${error.message}`)
    }

    revalidatePath("/financials/chart-of-accounts")
    redirect("/financials/chart-of-accounts")
  } catch (error: any) {
    console.error("Hesap güncellenirken hata:", error)
    throw new Error(`Hesap güncellenirken hata: ${error.message}`)
  }
}

export async function toggleAccountStatusAction(id: string, isActive: boolean) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("chart_of_accounts").update({ is_active: isActive }).eq("id", id)

    if (error) {
      console.error("Hesap durumu değiştirilirken hata:", error)
      throw new Error(`Hesap durumu değiştirilirken hata: ${error.message}`)
    }

    revalidatePath("/financials/chart-of-accounts")
  } catch (error: any) {
    console.error("Hesap durumu değiştirilirken hata:", error)
    throw new Error(`Hesap durumu değiştirilirken hata: ${error.message}`)
  }
}

export async function deleteAccountAction(id: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("chart_of_accounts").delete().eq("id", id)

    if (error) {
      console.error("Hesap silinirken hata:", error)
      throw new Error(`Hesap silinirken hata: ${error.message}`)
    }

    revalidatePath("/financials/chart-of-accounts")
  } catch (error: any) {
    console.error("Hesap silinirken hata:", error)
    throw new Error(`Hesap silinirken hata: ${error.message}`)
  }
}
