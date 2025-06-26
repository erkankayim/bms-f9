"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export type DashboardStats = {
  totalCustomers: number
  totalProducts: number
  totalSales: number
  totalRevenue: number
  averageSaleValue: number
  currency: string
}

export type RecentSale = {
  id: string
  sale_date: string
  customer_name: string | null
  final_amount: number
  status: string
}

export type RecentCustomer = {
  id: string // This will be populated by customer.mid
  mid: string
  name: string // This will be constructed
  created_at: string
}

// Helper function to construct customer name
function constructCustomerName(customer: {
  contact_name?: string | null
  first_name?: string | null // Kept for flexibility, but won't be selected if not present
  last_name?: string | null // Kept for flexibility, but won't be selected if not present
  company_name?: string | null
}): string {
  if (customer.contact_name && customer.contact_name.trim() !== "") {
    return customer.contact_name.trim()
  }
  if (customer.company_name && customer.company_name.trim() !== "") {
    return customer.company_name.trim()
  }
  // Fallback for first_name and last_name if they were somehow provided
  // and contact_name/company_name were empty or null.
  // This part will effectively be skipped if first_name/last_name are not in the SELECT.
  const firstName = customer.first_name || ""
  const lastName = customer.last_name || ""
  const fullName = `${firstName} ${lastName}`.trim()
  if (fullName) {
    return fullName
  }
  return "Bilinmeyen Müşteri"
}

export async function getDashboardStats(): Promise<{ data?: DashboardStats; error?: string }> {
  noStore()
  const supabase = createClient()

  try {
    const [
      { count: totalCustomers, error: customerError },
      { count: totalProducts, error: productError },
      { data: salesData, error: salesError, count: totalSalesCount },
    ] = await Promise.all([
      supabase.from("customers").select("mid", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("products").select("stock_code", { count: "exact", head: true }).is("deleted_at", null),
      supabase
        .from("sales")
        .select("final_amount, id", { count: "exact" })
        .not("status", "in", '("cancelled", "refunded")')
        .is("deleted_at", null),
    ])

    if (customerError) throw new Error(`Müşteri sayısı alınamadı: ${customerError.message}`)
    if (productError) throw new Error(`Ürün sayısı alınamadı: ${productError.message}`)
    if (salesError) throw new Error(`Satış verileri alınamadı: ${salesError.message}`)

    const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0
    const totalSales = totalSalesCount || 0
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0

    return {
      data: {
        totalCustomers: totalCustomers || 0,
        totalProducts: totalProducts || 0,
        totalSales: totalSales,
        totalRevenue: totalRevenue,
        averageSaleValue: averageSaleValue,
        currency: "TRY",
      },
    }
  } catch (error: any) {
    console.error("Kontrol paneli istatistikleri alınırken hata:", error)
    return { error: `Kontrol paneli istatistikleri alınırken hata: ${error.message}` }
  }
}

export async function getRecentSales(limit = 5): Promise<{ data?: RecentSale[]; error?: string }> {
  noStore()
  const supabase = createClient()
  try {
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select("id, sale_date, final_amount, status, customer_mid")
      .is("deleted_at", null)
      .order("sale_date", { ascending: false })
      .limit(limit)

    if (salesError) throw salesError
    if (!salesData || salesData.length === 0) {
      return { data: [] }
    }

    const customerMids = Array.from(
      new Set(salesData.map((s) => s.customer_mid).filter((mid) => mid != null)),
    ) as string[]

    const customersMap = new Map<string, string | null>()

    if (customerMids.length > 0) {
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("mid, contact_name, company_name") // Removed first_name, last_name
        .in("mid", customerMids)

      if (customersError) {
        // Check if the error is specifically about company_name not existing
        if (
          customersError.message.includes("column") &&
          customersError.message.includes("company_name") &&
          customersError.message.includes("does not exist")
        ) {
          console.warn("company_name kolonu müşteriler tablosunda bulunamadı. Sadece contact_name kullanılacak.")
          // Retry without company_name if it was the cause of the error
          const { data: customersDataRetry, error: customersErrorRetry } = await supabase
            .from("customers")
            .select("mid, contact_name")
            .in("mid", customerMids)

          if (customersErrorRetry) {
            console.warn(
              "Kontrol paneli son satışlar için müşteri adları alınamadı (retry):",
              customersErrorRetry.message,
            )
          } else if (customersDataRetry) {
            customersDataRetry.forEach((c) => customersMap.set(c.mid, constructCustomerName(c)))
          }
        } else {
          console.warn("Kontrol paneli son satışlar için müşteri adları alınamadı:", customersError.message)
        }
      } else if (customersData) {
        customersData.forEach((c) => customersMap.set(c.mid, constructCustomerName(c)))
      }
    }

    const recentSales = salesData.map((sale) => ({
      id: sale.id,
      sale_date: sale.sale_date,
      customer_name: sale.customer_mid
        ? customersMap.get(sale.customer_mid) || "Bilinmeyen Müşteri"
        : "Bilinmeyen Müşteri",
      final_amount: sale.final_amount || 0,
      status: sale.status,
    }))

    return { data: recentSales }
  } catch (error: any) {
    console.error("Son satışlar alınırken hata:", error)
    return { error: `Son satışlar alınırken hata: ${error.message}` }
  }
}

export async function getRecentCustomers(limit = 3): Promise<{ data?: RecentCustomer[]; error?: string }> {
  noStore()
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("mid, contact_name, company_name, created_at") // Removed first_name, last_name
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      // Check if the error is specifically about company_name not existing
      if (
        error.message.includes("column") &&
        error.message.includes("company_name") &&
        error.message.includes("does not exist")
      ) {
        console.warn("company_name kolonu müşteriler tablosunda bulunamadı. Sadece contact_name kullanılacak.")
        // Retry without company_name
        const { data: dataRetry, error: errorRetry } = await supabase
          .from("customers")
          .select("mid, contact_name, created_at")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (errorRetry) throw errorRetry
        if (!dataRetry || dataRetry.length === 0) return { data: [] }

        const recentCustomersRetry: RecentCustomer[] = dataRetry.map((customer) => ({
          id: customer.mid,
          mid: customer.mid,
          name: constructCustomerName(customer),
          created_at: customer.created_at,
        }))
        return { data: recentCustomersRetry }
      }
      throw error // Re-throw original error if not about company_name
    }
    if (!data || data.length === 0) {
      return { data: [] }
    }

    const recentCustomers: RecentCustomer[] = data.map((customer) => ({
      id: customer.mid,
      mid: customer.mid,
      name: constructCustomerName(customer),
      created_at: customer.created_at,
    }))

    return { data: recentCustomers }
  } catch (error: any) {
    console.error("Son müşteriler alınırken hata:", error)
    return { error: `Son müşteriler alınırken hata: ${error.message}` }
  }
}
