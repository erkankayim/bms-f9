"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

// --- Data Types ---
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

export type PerformanceTrendData = {
  month: string
  revenue: number
  newCustomers: number
}

export type RevenueByCategory = {
  category: string
  value: number
  color: string
}

export type TopProduct = {
  name: string
  sales: number
  revenue: number
}

export type LowStockProduct = {
  stock_code: string
  name: string
  quantity: number
  low_stock_threshold: number
}

// --- Helper Functions ---
function constructCustomerName(customer: {
  contact_name?: string | null
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  name?: string | null
}): string {
  if (customer.name && customer.name.trim() !== "") return customer.name.trim()
  if (customer.contact_name && customer.contact_name.trim() !== "") return customer.contact_name.trim()
  if (customer.company_name && customer.company_name.trim() !== "") return customer.company_name.trim()
  const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
  return fullName || "Bilinmeyen Müşteri"
}

function formatSaleTypeTR(type: string | null | undefined): string {
  if (!type) return "Diğer"
  switch (type) {
    case "product_sale":
      return "Ürün Satışı"
    case "service_sale":
      return "Hizmet Satışı"
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

// --- Server Actions ---

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
      .select("id, sale_date, final_amount, status, customers(mid, name, contact_name, company_name)")
      .is("deleted_at", null)
      .order("sale_date", { ascending: false })
      .limit(limit)

    if (salesError) throw salesError

    const recentSales = salesData.map((sale: any) => ({
      id: sale.id,
      sale_date: sale.sale_date,
      customer_name: sale.customers ? constructCustomerName(sale.customers) : "Bilinmeyen Müşteri",
      final_amount: sale.final_amount || 0,
      status: sale.status,
    }))

    return { data: recentSales }
  } catch (error: any) {
    console.error("Son satışlar alınırken hata:", error)
    return { error: `Son satışlar alınırken hata: ${error.message}` }
  }
}

export async function getPerformanceTrendData(): Promise<{ data?: PerformanceTrendData[]; error?: string }> {
  noStore()
  const supabase = createClient()
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const sixMonthsAgoISO = sixMonthsAgo.toISOString()

    const [{ data: salesData, error: salesError }, { data: customersData, error: customersError }] = await Promise.all([
      supabase
        .from("sales")
        .select("sale_date, final_amount")
        .gte("sale_date", sixMonthsAgoISO)
        .not("status", "in", '("cancelled", "refunded")')
        .is("deleted_at", null),
      supabase.from("customers").select("created_at").gte("created_at", sixMonthsAgoISO).is("deleted_at", null),
    ])

    if (salesError) throw salesError
    if (customersError) throw customersError

    const monthlyData = new Map<string, { revenue: number; newCustomers: number }>()

    salesData?.forEach((sale) => {
      const date = new Date(sale.sale_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!monthlyData.has(monthKey)) monthlyData.set(monthKey, { revenue: 0, newCustomers: 0 })
      monthlyData.get(monthKey)!.revenue += sale.final_amount || 0
    })

    customersData?.forEach((customer) => {
      const date = new Date(customer.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!monthlyData.has(monthKey)) monthlyData.set(monthKey, { revenue: 0, newCustomers: 0 })
      monthlyData.get(monthKey)!.newCustomers += 1
    })

    const result: PerformanceTrendData[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("tr-TR", { month: "short" })
      const data = monthlyData.get(monthKey) || { revenue: 0, newCustomers: 0 }
      result.push({ month: monthName, ...data })
    }

    return { data: result }
  } catch (error: any) {
    console.error("Performans trendi verileri alınırken hata:", error)
    return { error: `Performans trendi verileri alınırken hata: ${error.message}` }
  }
}

export async function getRevenueByCategory(): Promise<{ data?: RevenueByCategory[]; error?: string }> {
  noStore()
  const supabase = createClient()
  try {
    const { data: salesData, error } = await supabase
      .from("sales")
      .select("final_amount, sale_type")
      .not("status", "in", '("cancelled", "refunded")')
      .is("deleted_at", null)
    if (error) throw error

    const categoryRevenue = new Map<string, number>()
    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"]

    salesData?.forEach((sale) => {
      const category = formatSaleTypeTR(sale.sale_type)
      const currentRevenue = categoryRevenue.get(category) || 0
      categoryRevenue.set(category, currentRevenue + (sale.final_amount || 0))
    })

    if (categoryRevenue.size === 0) return { data: [] }

    const result: RevenueByCategory[] = Array.from(categoryRevenue.entries())
      .map(([category, value], index) => ({ category, value, color: colors[index % colors.length] }))
      .sort((a, b) => b.value - a.value)

    return { data: result }
  } catch (error: any) {
    console.error("Kategoriye göre gelir verileri alınırken hata:", error)
    return { error: `Kategoriye göre gelir verileri alınırken hata: ${error.message}` }
  }
}

export async function getTopProducts(limit = 5): Promise<{ data?: TopProduct[]; error?: string }> {
  noStore()
  const supabase = createClient()
  try {
    const { data: salesItems, error } = await supabase
      .from("sale_items")
      .select(`quantity, unit_price, products!inner(stock_code, name)`)
      .not("products.deleted_at", "is", null)
    if (error) throw error
    if (!salesItems || salesItems.length === 0) return { data: [] }

    const productPerformance = new Map<string, { name: string; sales: number; revenue: number }>()

    salesItems.forEach((item: any) => {
      if (!item.products) return
      const { stock_code, name } = item.products
      const revenue = (item.quantity || 0) * (item.unit_price || 0)
      const current = productPerformance.get(stock_code) || { name: name || `Ürün ${stock_code}`, sales: 0, revenue: 0 }
      current.sales += item.quantity || 0
      current.revenue += revenue
      productPerformance.set(stock_code, current)
    })

    const result = Array.from(productPerformance.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    return { data: result }
  } catch (error: any) {
    console.error("En çok satan ürünler alınırken hata:", error)
    return { error: `En çok satan ürünler alınırken hata: ${error.message}` }
  }
}

export async function getLowStockProducts(limit = 5): Promise<{ data?: LowStockProduct[]; error?: string }> {
  noStore()
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from("products")
      .select("stock_code, name, quantity, low_stock_threshold")
      .is("deleted_at", null)
      .not("low_stock_threshold", "is", null)
      .expr("quantity", "<", "low_stock_threshold")
      .order("quantity", { ascending: true })
      .limit(limit)
    if (error) throw error
    return { data: data || [] }
  } catch (error: any) {
    console.error("Düşük stoklu ürünler alınırken hata:", error)
    return { error: `Düşük stoklu ürünler alınırken hata: ${error.message}` }
  }
}
