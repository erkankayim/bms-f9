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

export type SalesChartData = {
  month: string
  sales: number
  revenue: number
}

export type TopProduct = {
  name: string
  sales_count: number
  total_revenue: number
}

export type StatusDistribution = {
  status: string
  count: number
  percentage: number
}

export type MonthlyComparison = {
  current_month: {
    sales: number
    revenue: number
    customers: number
  }
  previous_month: {
    sales: number
    revenue: number
    customers: number
  }
  growth: {
    sales_growth: number
    revenue_growth: number
    customer_growth: number
  }
}

// Helper function to construct customer name
function constructCustomerName(customer: {
  contact_name?: string | null
  company_name?: string | null
}): string {
  if (customer.contact_name && customer.contact_name.trim() !== "") {
    return customer.contact_name.trim()
  }
  if (customer.company_name && customer.company_name.trim() !== "") {
    return customer.company_name.trim()
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

export async function getSalesChartData(): Promise<{ data?: SalesChartData[]; error?: string }> {
  noStore()
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("sales")
      .select("sale_date, final_amount")
      .gte("sale_date", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
      .not("status", "in", '("cancelled", "refunded")')
      .is("deleted_at", null)

    if (error) throw error

    // Group by month
    const monthlyData = new Map<string, { sales: number; revenue: number }>()

    data?.forEach((sale) => {
      const date = new Date(sale.sale_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("tr-TR", { year: "numeric", month: "short" })

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { sales: 0, revenue: 0 })
      }

      const current = monthlyData.get(monthKey)!
      current.sales += 1
      current.revenue += sale.final_amount || 0
    })

    const chartData: SalesChartData[] = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split("-")
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
        return {
          month: date.toLocaleDateString("tr-TR", { month: "short", year: "numeric" }),
          sales: data.sales,
          revenue: data.revenue,
        }
      })

    return { data: chartData }
  } catch (error: any) {
    console.error("Satış grafik verileri alınırken hata:", error)
    return { error: `Satış grafik verileri alınırken hata: ${error.message}` }
  }
}

export async function getTopProducts(): Promise<{ data?: TopProduct[]; error?: string }> {
  noStore()
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("sale_items")
      .select(`
        product_name,
        quantity,
        unit_price,
        sales!inner(status)
      `)
      .not("sales.status", "in", '("cancelled", "refunded")')
      .is("sales.deleted_at", null)

    if (error) throw error

    // Group by product
    const productMap = new Map<string, { count: number; revenue: number }>()

    data?.forEach((item) => {
      const productName = item.product_name || "Bilinmeyen Ürün"
      if (!productMap.has(productName)) {
        productMap.set(productName, { count: 0, revenue: 0 })
      }

      const current = productMap.get(productName)!
      current.count += item.quantity || 0
      current.revenue += (item.quantity || 0) * (item.unit_price || 0)
    })

    const topProducts: TopProduct[] = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        sales_count: data.count,
        total_revenue: data.revenue,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 5)

    return { data: topProducts }
  } catch (error: any) {
    console.error("En çok satan ürünler alınırken hata:", error)
    return { error: `En çok satan ürünler alınırken hata: ${error.message}` }
  }
}

export async function getStatusDistribution(): Promise<{ data?: StatusDistribution[]; error?: string }> {
  noStore()
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("sales").select("status").is("deleted_at", null)

    if (error) throw error

    const statusMap = new Map<string, number>()
    const total = data?.length || 0

    data?.forEach((sale) => {
      const status = sale.status || "unknown"
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })

    const distribution: StatusDistribution[] = Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    return { data: distribution }
  } catch (error: any) {
    console.error("Durum dağılımı alınırken hata:", error)
    return { error: `Durum dağılımı alınırken hata: ${error.message}` }
  }
}

export async function getMonthlyComparison(): Promise<{ data?: MonthlyComparison; error?: string }> {
  noStore()
  const supabase = createClient()

  try {
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const [currentSales, previousSales, currentCustomers, previousCustomers] = await Promise.all([
      supabase
        .from("sales")
        .select("final_amount")
        .gte("sale_date", currentMonthStart.toISOString())
        .not("status", "in", '("cancelled", "refunded")')
        .is("deleted_at", null),
      supabase
        .from("sales")
        .select("final_amount")
        .gte("sale_date", previousMonthStart.toISOString())
        .lt("sale_date", currentMonthStart.toISOString())
        .not("status", "in", '("cancelled", "refunded")')
        .is("deleted_at", null),
      supabase
        .from("customers")
        .select("mid", { count: "exact", head: true })
        .gte("created_at", currentMonthStart.toISOString())
        .is("deleted_at", null),
      supabase
        .from("customers")
        .select("mid", { count: "exact", head: true })
        .gte("created_at", previousMonthStart.toISOString())
        .lt("created_at", currentMonthStart.toISOString())
        .is("deleted_at", null),
    ])

    const currentMonthRevenue = currentSales.data?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0
    const previousMonthRevenue = previousSales.data?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0

    const currentMonthSalesCount = currentSales.data?.length || 0
    const previousMonthSalesCount = previousSales.data?.length || 0

    const currentMonthCustomers = currentCustomers.count || 0
    const previousMonthCustomers = previousCustomers.count || 0

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const comparison: MonthlyComparison = {
      current_month: {
        sales: currentMonthSalesCount,
        revenue: currentMonthRevenue,
        customers: currentMonthCustomers,
      },
      previous_month: {
        sales: previousMonthSalesCount,
        revenue: previousMonthRevenue,
        customers: previousMonthCustomers,
      },
      growth: {
        sales_growth: calculateGrowth(currentMonthSalesCount, previousMonthSalesCount),
        revenue_growth: calculateGrowth(currentMonthRevenue, previousMonthRevenue),
        customer_growth: calculateGrowth(currentMonthCustomers, previousMonthCustomers),
      },
    }

    return { data: comparison }
  } catch (error: any) {
    console.error("Aylık karşılaştırma alınırken hata:", error)
    return { error: `Aylık karşılaştırma alınırken hata: ${error.message}` }
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
        console.warn("Kontrol paneli son satışlar için müşteri adları alınamadı:", customersError.message)
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

    if (error) throw error
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
