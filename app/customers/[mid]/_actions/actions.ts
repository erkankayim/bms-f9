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

// --- YENİ SİLME MANTIĞI ---
export async function deleteCustomer(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const customerId = formData.get("customerId") as string

  if (!customerId) {
    return { success: false, message: "Geçersiz Müşteri ID." }
  }

  console.log(`[Action: deleteCustomer] Arşivleme işlemi başlatıldı: ${customerId}`)
  const supabase = createClient()

  try {
    const { error: updateError } = await supabase
      .from("customers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("mid", customerId)

    if (updateError) {
      console.error(`[Action: deleteCustomer] Arşivleme hatası:`, updateError.message)
      return { success: false, message: `Veritabanı hatası: ${updateError.message}` }
    }

    console.log(`[Action: deleteCustomer] Başarıyla arşivlendi: ${customerId}`)
    revalidatePath("/customers")
    revalidatePath(`/customers/${customerId}`)

    return { success: true, message: "Müşteri başarıyla arşivlendi." }
  } catch (e) {
    const error = e as Error
    console.error(`[Action: deleteCustomer] Beklenmedik hata:`, error.message)
    return { success: false, message: "Sunucuda beklenmedik bir hata oluştu." }
  }
}

// --- YENİ GERİ YÜKLEME MANTIĞI ---
export async function restoreCustomer(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const customerId = formData.get("customerId") as string

  if (!customerId) {
    return { success: false, message: "Geçersiz Müşteri ID." }
  }

  console.log(`[Action: restoreCustomer] Geri yükleme işlemi başlatıldı: ${customerId}`)
  const supabase = createClient()

  try {
    const { error: updateError } = await supabase.from("customers").update({ deleted_at: null }).eq("mid", customerId)

    if (updateError) {
      console.error(`[Action: restoreCustomer] Geri yükleme hatası:`, updateError.message)
      return { success: false, message: `Veritabanı hatası: ${updateError.message}` }
    }

    console.log(`[Action: restoreCustomer] Başarıyla geri yüklendi: ${customerId}`)
    revalidatePath("/customers")
    revalidatePath(`/customers/${customerId}`)

    return { success: true, message: "Müşteri başarıyla geri yüklendi." }
  } catch (e) {
    const error = e as Error
    console.error(`[Action: restoreCustomer] Beklenmedik hata:`, error.message)
    return { success: false, message: "Sunucuda beklenmedik bir hata oluştu." }
  }
}
