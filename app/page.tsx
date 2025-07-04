"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getDashboardStats,
  getRecentSales,
  getRecentCustomers,
  getSalesTrendData,
  getCustomerGrowthData,
  getTopProducts,
  getRevenueByCategory,
} from "@/app/_actions/dashboard-actions"
import DashboardCharts from "@/app/_components/dashboard-charts"
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Target,
  ArrowUpRight,
  Activity,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-96 bg-slate-200 animate-pulse rounded" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-slate-200 animate-pulse rounded" />
                  <div className="h-5 w-5 bg-slate-200 animate-pulse rounded" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-slate-200 animate-pulse rounded mb-2" />
                <div className="h-3 w-40 bg-slate-200 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
                  <div className="h-4 w-64 bg-slate-200 animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-slate-200 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="h-5 w-32 bg-slate-200 animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-slate-200 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

async function DashboardContent() {
  const [
    statsResult,
    recentSalesResult,
    recentCustomersResult,
    salesTrendResult,
    customerGrowthResult,
    topProductsResult,
    revenueCategoryResult,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentSales(8),
    getRecentCustomers(6),
    getSalesTrendData(),
    getCustomerGrowthData(),
    getTopProducts(),
    getRevenueByCategory(),
  ])

  const stats = statsResult.data
  const recentSales = recentSalesResult.data || []
  const recentCustomers = recentCustomersResult.data || []
  const salesTrend = salesTrendResult.data || []
  const customerGrowthData = customerGrowthResult.data || []
  const topProducts = topProductsResult.data || []
  const revenueByCategory = revenueCategoryResult.data || []

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-slate-800">Veri Yüklenemedi</h3>
          <p className="text-slate-600">Dashboard verileri yüklenirken bir hata oluştu.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Sayfayı Yenile
          </Button>
        </div>
      </div>
    )
  }

  // Calculate growth percentages (mock data for demo)
  const revenueGrowth = 12.5
  const salesGrowth = 8.3
  const productGrowth = 5.7

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-[1920px] mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">İş Yönetim Dashboard</h1>
          <p className="text-lg text-slate-600">İşletmenizin performansını takip edin ve analiz edin</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-emerald-100">Toplam Gelir</CardTitle>
                <DollarSign className="h-5 w-5 text-emerald-200" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-2">
                ₺{stats.totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
              </div>
              <div className="flex items-center text-emerald-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+{revenueGrowth}% bu ay</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-100">Toplam Satış</CardTitle>
                <ShoppingCart className="h-5 w-5 text-blue-200" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-2">{stats.totalSales.toLocaleString("tr-TR")}</div>
              <div className="flex items-center text-blue-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+{salesGrowth}% bu ay</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-100">Müşteri Sayısı</CardTitle>
                <Users className="h-5 w-5 text-purple-200" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-2">{stats.totalCustomers.toLocaleString("tr-TR")}</div>
              <div className="flex items-center text-purple-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+{customerGrowthData}% bu ay</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-100">Ürün Çeşidi</CardTitle>
                <Package className="h-5 w-5 text-orange-200" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-2">{stats.totalProducts.toLocaleString("tr-TR")}</div>
              <div className="flex items-center text-orange-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+{productGrowth}% bu ay</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            <DashboardCharts
              salesTrendData={salesTrend}
              customerGrowthData={customerGrowthData}
              revenueByCategory={revenueByCategory}
              topProducts={topProducts}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Sales */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Son Satışlar
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <Link href="/sales">Tümünü Gör</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-slate-800 truncate">
                          {sale.customer_name || "Bilinmeyen Müşteri"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(sale.sale_date).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-emerald-600">
                          ₺{sale.final_amount.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
                        </p>
                        <Badge variant={sale.status === "completed" ? "default" : "secondary"} className="text-xs mt-1">
                          {sale.status === "completed"
                            ? "Tamamlandı"
                            : sale.status === "pending"
                              ? "Bekliyor"
                              : "Diğer"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Henüz satış bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Customers */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Yeni Müşteriler
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                    <Link href="/customers">Tümünü Gör</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                {recentCustomers.length > 0 ? (
                  recentCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-slate-800 truncate">{customer.name}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(customer.created_at).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="ml-4 bg-transparent">
                        <Link href={`/customers/${customer.mid}`}>Görüntüle</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Henüz müşteri bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-indigo-600" />
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  className="w-full justify-start h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Link href="/sales/new">
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    Yeni Satış Oluştur
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start h-12 border-2 hover:bg-slate-50 bg-transparent"
                >
                  <Link href="/customers/new">
                    <Users className="h-5 w-5 mr-3" />
                    Yeni Müşteri Ekle
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start h-12 border-2 hover:bg-slate-50 bg-transparent"
                >
                  <Link href="/products/new">
                    <Package className="h-5 w-5 mr-3" />
                    Yeni Ürün Ekle
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start h-12 border-2 hover:bg-slate-50 bg-transparent"
                >
                  <Link href="/financials/income/new">
                    <CreditCard className="h-5 w-5 mr-3" />
                    Gelir Kaydı Ekle
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                  Performans Metrikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Aylık Hedef</span>
                    <span className="font-medium text-slate-800">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Müşteri Memnuniyeti</span>
                    <span className="font-medium text-slate-800">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Stok Durumu</span>
                    <span className="font-medium text-slate-800">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      ₺{stats.averageSaleValue.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-slate-600">Ortalama Satış</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(stats.totalRevenue / stats.totalCustomers || 0)}
                    </p>
                    <p className="text-sm text-slate-600">Müşteri Başına</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
