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
  id: string
  mid: string
  name: string
  created_at: string
}

export type SalesGrowthData = {
  month: string
  sales: number
  customers: number
}

export type CustomerGrowthData = {
  month: string
  newCustomers: number
  totalCustomers: number
}

// Helper function to construct customer name
function constructCustomerName(customer: {
  contact_name?: string | null
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
}): string {
  if (customer.contact_name && customer.contact_name.trim() !== "") {
    return customer.contact_name.trim()
  }
  if (customer.company_name && customer.company_name.trim() !== "") {
    return customer.company_name.trim()
  }
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
        .select("mid, contact_name, company_name")
        .in("mid", customerMids)

      if (customersError) {
        if (
          customersError.message.includes("column") &&
          customersError.message.includes("company_name") &&
          customersError.message.includes("does not exist")
        ) {
          console.warn("company_name kolonu müşteriler tablosunda bulunamadı. Sadece contact_name kullanılacak.")
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
      .select("mid, contact_name, company_name, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      if (
        error.message.includes("column") &&
        error.message.includes("company_name") &&
        error.message.includes("does not exist")
      ) {
        console.warn("company_name kolonu müşteriler tablosunda bulunamadı. Sadece contact_name kullanılacak.")
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
      throw error
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

export async function getSalesGrowthData(): Promise<{ data?: SalesGrowthData[]; error?: string }> {
  noStore()
  const supabase = createClient()

  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: salesData, error } = await supabase
      .from("sales")
      .select("sale_date, customer_mid")
      .gte("sale_date", sixMonthsAgo.toISOString())
      .not("status", "in", '("cancelled", "refunded")')
      .is("deleted_at", null)
      .order("sale_date", { ascending: true })

    if (error) throw error

    // Aylık verileri grupla
    const monthlyData = new Map<string, { sales: number; customers: Set<string> }>()

    salesData?.forEach((sale) => {
      const date = new Date(sale.sale_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("tr-TR", { month: "short" })

      if (!monthlyData.has(monthName)) {
        monthlyData.set(monthName, { sales: 0, customers: new Set() })
      }

      const current = monthlyData.get(monthName)!
      current.sales += 1
      if (sale.customer_mid) {
        current.customers.add(sale.customer_mid)
      }
    })

    // Son 6 ayı sırala ve formatla
    const result: SalesGrowthData[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("tr-TR", { month: "short" })

      const data = monthlyData.get(monthName) || { sales: 0, customers: new Set() }
      result.push({
        month: monthName,
        sales: data.sales,
        customers: data.customers.size,
      })
    }

    return { data: result }
  } catch (error: any) {
    console.error("Satış büyüme verileri alınırken hata:", error)
    return { error: `Satış büyüme verileri alınırken hata: ${error.message}` }
  }
}

export async function getCustomerGrowthData(): Promise<{ data?: CustomerGrowthData[]; error?: string }> {
  noStore()
  const supabase = createClient()

  try {
    // Son 6 ayın verilerini al
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: customersData, error } = await supabase
      .from("customers")
      .select("created_at")
      .gte("created_at", sixMonthsAgo.toISOString())
      .is("deleted_at", null)
      .order("created_at", { ascending: true })

    if (error) throw error

    // Aylık yeni müşteri sayılarını hesapla
    const monthlyNewCustomers = new Map<string, number>()

    customersData?.forEach((customer) => {
      const date = new Date(customer.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("tr-TR", { month: "short" })

      monthlyNewCustomers.set(monthName, (monthlyNewCustomers.get(monthName) || 0) + 1)
    })

    // Toplam müşteri sayısını al
    const { count: totalCustomersCount } = await supabase
      .from("customers")
      .select("mid", { count: "exact", head: true })
      .is("deleted_at", null)

    const result: CustomerGrowthData[] = []
    let runningTotal = (totalCustomersCount || 0) - (customersData?.length || 0)

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("tr-TR", { month: "short" })

      const newCustomers = monthlyNewCustomers.get(monthName) || 0
      runningTotal += newCustomers

      result.push({
        month: monthName,
        newCustomers,
        totalCustomers: runningTotal,
      })
    }

    return { data: result }
  } catch (error: any) {
    console.error("Müşteri büyüme verileri alınırken hata:", error)
    return { error: `Müşteri büyüme verileri alınırken hata: ${error.message}` }
  }
}
