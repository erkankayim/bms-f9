"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Customer, Sale, Invoice, PurchaseInsights, CustomerPageData } from "../_components/helpers"

export async function getCustomerPageData(
  customerId: string,
): Promise<{ data: CustomerPageData | null; error: string | null }> {
  const supabase = createClient()

  try {
    console.log(`[Action INFO] Fetching data for customer MID: ${customerId} (dynamic page)`)

    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("mid", customerId)
      .single()

    if (customerError || !customerData) {
      console.error(`[Action Error] Customer fetch failed for MID ${customerId}:`, customerError?.message)
      return { data: null, error: "Müşteri bulunamadı veya veritabanı hatası oluştu." }
    }
    console.log(`[Action INFO] Customer data fetched for ${customerId}`)

    const customer = customerData as Customer

    const salesQuery = supabase
      .from("sales")
      .select("id, sale_date, total_amount, status")
      .eq("customer_mid", customerId)

    const [salesResult, invoicesResult] = await Promise.allSettled([
      salesQuery,
      supabase
        .from("invoices")
        .select("id, invoice_number, issue_date, total_amount, status")
        .eq("customer_id", customerId),
    ])

    console.log(`[Action INFO] Sales and Invoices data promise settled for ${customerId}`)

    const sales: Sale[] = salesResult.status === "fulfilled" && salesResult.value.data ? salesResult.value.data : []
    const invoices: Invoice[] =
      invoicesResult.status === "fulfilled" && invoicesResult.value.data ? invoicesResult.value.data : []

    console.log(`[Action INFO] Sales count for ${customerId}: ${sales.length}`)
    if (salesResult.status === "fulfilled" && salesResult.value.error) {
      console.error(`[Action Error] Sales fetch error for ${customerId}:`, salesResult.value.error.message)
    }

    if (salesResult.status === "rejected") {
      console.warn(`[Action Warn] Sales fetch promise rejected for customer ${customerId}:`, salesResult.reason)
    }
    if (invoicesResult.status === "rejected") {
      console.warn(`[Action Warn] Invoices fetch promise rejected for customer ${customerId}:`, invoicesResult.reason)
    }

    let insights: PurchaseInsights | null = null
    if (sales.length > 0) {
      const validSales = sales.filter((s) => typeof s.total_amount === "number")
      const total_spending = validSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
      const sortedSales = [...sales].sort((a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime())
      insights = {
        total_spending,
        total_orders: sales.length,
        first_purchase_date: sortedSales[0]?.sale_date || null,
        last_purchase_date: sortedSales[sortedSales.length - 1]?.sale_date || null,
      }
    }
    console.log(`[Action INFO] Insights calculated for ${customerId}`)

    return {
      data: { customer, sales, invoices, insights },
      error: null,
    }
  } catch (e: any) {
    console.error(`[Action CRITICAL] Unhandled exception for customer ${customerId}:`, e)
    return { data: null, error: "Sunucuda beklenmedik bir hata oluştu. Lütfen tekrar deneyin." }
  }
}

export async function deleteCustomer(customerId: string): Promise<{ success: boolean; message: string }> {
  console.log(`[Delete Action] Starting delete for customer: "${customerId}" (type: ${typeof customerId})`)

  // Strict validation
  if (!customerId || typeof customerId !== "string" || customerId.trim() === "") {
    console.error(`[Delete Action] Invalid customer ID provided:`, { customerId, type: typeof customerId })
    return { success: false, message: "Geçersiz müşteri ID" }
  }

  // Clean the customer ID
  const cleanCustomerId = customerId.trim()
  console.log(`[Delete Action] Cleaned customer ID: "${cleanCustomerId}"`)

  const supabase = createClient()

  try {
    console.log(`[Delete Action] Attempting to archive customer: ${cleanCustomerId}`)

    // Önce müşterinin var olup olmadığını kontrol et
    const { data: existingCustomer, error: checkError } = await supabase
      .from("customers")
      .select("mid, name")
      .eq("mid", cleanCustomerId)
      .single()

    if (checkError) {
      console.error(`[Delete Action] Database error checking customer:`, checkError)
      return { success: false, message: `Veritabanı hatası: ${checkError.message}` }
    }

    if (!existingCustomer) {
      console.error(`[Delete Action] Customer not found: ${cleanCustomerId}`)
      return { success: false, message: "Müşteri bulunamadı" }
    }

    console.log(`[Delete Action] Customer found:`, existingCustomer)

    // Müşteriyi arşivle
    const { data: updateData, error: updateError } = await supabase
      .from("customers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("mid", cleanCustomerId)
      .select()

    if (updateError) {
      console.error(`[Delete Action Error] Failed to archive customer ${cleanCustomerId}:`, updateError)
      return { success: false, message: `Arşivleme başarısız: ${updateError.message}` }
    }

    console.log(`[Delete Action] Successfully archived customer:`, updateData)

    // Revalidate paths
    try {
      revalidatePath("/customers")
      revalidatePath(`/customers/${cleanCustomerId}`)
      console.log(`[Delete Action] Paths revalidated successfully`)
    } catch (revalidateError) {
      console.warn(`[Delete Action] Revalidation warning:`, revalidateError)
    }

    return { success: true, message: "Müşteri başarıyla arşivlendi." }
  } catch (error: any) {
    console.error(`[Delete Action Critical] Unexpected error archiving customer ${cleanCustomerId}:`, error)
    return { success: false, message: "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin." }
  }
}

export async function restoreCustomer(customerId: string): Promise<{ success: boolean; message: string }> {
  console.log(`[Restore Action] Starting restore for customer: "${customerId}" (type: ${typeof customerId})`)

  // Strict validation
  if (!customerId || typeof customerId !== "string" || customerId.trim() === "") {
    console.error(`[Restore Action] Invalid customer ID provided:`, { customerId, type: typeof customerId })
    return { success: false, message: "Geçersiz müşteri ID" }
  }

  // Clean the customer ID
  const cleanCustomerId = customerId.trim()
  console.log(`[Restore Action] Cleaned customer ID: "${cleanCustomerId}"`)

  const supabase = createClient()

  try {
    console.log(`[Restore Action] Attempting to restore customer: ${cleanCustomerId}`)

    // Önce müşterinin var olup olmadığını kontrol et
    const { data: existingCustomer, error: checkError } = await supabase
      .from("customers")
      .select("mid, name")
      .eq("mid", cleanCustomerId)
      .single()

    if (checkError) {
      console.error(`[Restore Action] Database error checking customer:`, checkError)
      return { success: false, message: `Veritabanı hatası: ${checkError.message}` }
    }

    if (!existingCustomer) {
      console.error(`[Restore Action] Customer not found: ${cleanCustomerId}`)
      return { success: false, message: "Müşteri bulunamadı" }
    }

    console.log(`[Restore Action] Customer found:`, existingCustomer)

    // Müşteriyi geri yükle
    const { data: updateData, error: updateError } = await supabase
      .from("customers")
      .update({ deleted_at: null })
      .eq("mid", cleanCustomerId)
      .select()

    if (updateError) {
      console.error(`[Restore Action Error] Failed to restore customer ${cleanCustomerId}:`, updateError)
      return { success: false, message: `Geri yükleme başarısız: ${updateError.message}` }
    }

    console.log(`[Restore Action] Successfully restored customer:`, updateData)

    // Revalidate paths
    try {
      revalidatePath("/customers")
      revalidatePath(`/customers/${cleanCustomerId}`)
      console.log(`[Restore Action] Paths revalidated successfully`)
    } catch (revalidateError) {
      console.warn(`[Restore Action] Revalidation warning:`, revalidateError)
    }

    return { success: true, message: "Müşteri başarıyla geri yüklendi." }
  } catch (error: any) {
    console.error(`[Restore Action Critical] Unexpected error restoring customer ${cleanCustomerId}:`, error)
    return { success: false, message: "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin." }
  }
}
