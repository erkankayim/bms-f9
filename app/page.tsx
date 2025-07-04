import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Target,
  ArrowUpRight,
  Activity,
  CreditCard,
  BarChart3,
  PieChartIcon,
  Award,
} from "lucide-react"
import Link from "next/link"
import {
  getDashboardStats,
  getRecentSales,
  getRecentCustomers,
  getSalesTrendData,
  getCustomerGrowthData,
  getTopProducts,
  getRevenueByCategory,
} from "@/app/_actions/dashboard-actions"

async function DashboardContent() {
  let stats = null
  let recentSales: any[] = []
  let recentCustomers: any[] = []
  let salesTrend: any[] = []
  let customerGrowthData: any[] = []
  let topProducts: any[] = []
  let revenueByCategory: any[] = []

  try {
    // Try to fetch data, but don't fail if it doesn't work
    const [
      statsResult,
      recentSalesResult,
      recentCustomersResult,
      salesTrendResult,
      customerGrowthResult,
      topProductsResult,
      revenueCategoryResult,
    ] = await Promise.allSettled([
      getDashboardStats(),
      getRecentSales(5),
      getRecentCustomers(5),
      getSalesTrendData(),
      getCustomerGrowthData(),
      getTopProducts(),
      getRevenueByCategory(),
    ])

    if (statsResult.status === "fulfilled") {
      stats = statsResult.value.data
    }
    if (recentSalesResult.status === "fulfilled") {
      recentSales = recentSalesResult.value.data || []
    }
    if (recentCustomersResult.status === "fulfilled") {
      recentCustomers = recentCustomersResult.value.data || []
    }
    if (salesTrendResult.status === "fulfilled") {
      salesTrend = salesTrendResult.value.data || []
    }
    if (customerGrowthResult.status === "fulfilled") {
      customerGrowthData = customerGrowthResult.value.data || []
    }
    if (topProductsResult.status === "fulfilled") {
      topProducts = topProductsResult.value.data || []
    }
    if (revenueCategoryResult.status === "fulfilled") {
      revenueByCategory = revenueCategoryResult.value.data || []
    }
  } catch (error) {
    console.error("Dashboard data fetch error:", error)
    // Continue with empty data
  }

  // Default stats if data fetch fails
  const defaultStats = {
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    averageSaleValue: 0,
  }

  const displayStats = stats || defaultStats

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
                ₺{displayStats.totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
              </div>
              <div className="flex items-center text-emerald-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+12.5% bu ay</span>
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
              <div className="text-3xl font-bold mb-2">{displayStats.totalSales.toLocaleString("tr-TR")}</div>
              <div className="flex items-center text-blue-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+8.3% bu ay</span>
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
              <div className="text-3xl font-bold mb-2">{displayStats.totalCustomers.toLocaleString("tr-TR")}</div>
              <div className="flex items-center text-purple-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+15.2% bu ay</span>
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
              <div className="text-3xl font-bold mb-2">{displayStats.totalProducts.toLocaleString("tr-TR")}</div>
              <div className="flex items-center text-orange-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+5.7% bu ay</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sales Trend Chart Placeholder */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-semibold text-slate-800 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-emerald-600" />
                  Satış ve Gelir Trendi
                </CardTitle>
                <p className="text-base text-slate-600 mt-2">Son 6 ayın detaylı performans analizi</p>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Satış Trendi Grafiği</p>
                    <p className="text-sm text-slate-500">Veriler yükleniyor...</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Growth */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-3 text-purple-600" />
                    Müşteri Büyümesi
                  </CardTitle>
                  <p className="text-slate-600">Aylık yeni müşteri kazanımı</p>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600">Müşteri Grafiği</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Category */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-3 text-blue-600" />
                    Gelir Dağılımı
                  </CardTitle>
                  <p className="text-slate-600">Kategorilere göre gelir analizi</p>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PieChartIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600">Gelir Dağılımı</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                  <Award className="h-5 w-5 mr-3 text-amber-600" />
                  En Çok Satan Ürünler
                </CardTitle>
                <p className="text-slate-600">Satış performansına göre sıralama</p>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Award className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">En Çok Satan Ürünler</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      ₺{displayStats.averageSaleValue.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-slate-600">Ortalama Satış</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      ₺
                      {Math.round(
                        displayStats.totalRevenue / Math.max(displayStats.totalCustomers, 1) || 0,
                      ).toLocaleString("tr-TR")}
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
  return <DashboardContent />
}
