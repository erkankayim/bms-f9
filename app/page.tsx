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
import { TrendingUp, Users, Package, DollarSign, ShoppingCart, AlertTriangle, Calendar, Target } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
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
    getRecentSales(5),
    getRecentCustomers(5),
    getSalesTrendData(),
    getCustomerGrowthData(),
    getTopProducts(),
    getRevenueByCategory(),
  ])

  const stats = statsResult.data
  const recentSales = recentSalesResult.data || []
  const recentCustomers = recentCustomersResult.data || []
  const salesTrend = salesTrendResult.data || []
  const customerGrowth = customerGrowthResult.data || []
  const topProducts = topProductsResult.data || []
  const revenueByCategory = revenueCategoryResult.data || []

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Veri Yüklenemedi</h3>
          <p className="text-muted-foreground">Dashboard verileri yüklenirken bir hata oluştu.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ana İstatistikler - 1920px için optimize edilmiş */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₺{stats.totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Ortalama satış: ₺{stats.averageSaleValue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalSales.toLocaleString("tr-TR")}</div>
            <p className="text-xs text-muted-foreground">Aktif satış işlemleri</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteri Sayısı</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers.toLocaleString("tr-TR")}</div>
            <p className="text-xs text-muted-foreground">Kayıtlı müşteriler</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ürün Çeşidi</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalProducts.toLocaleString("tr-TR")}</div>
            <p className="text-xs text-muted-foreground">Aktif ürünler</p>
          </CardContent>
        </Card>
      </div>

      {/* Grafikler ve Analizler - 1920px için 3 sütun */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sol Kolon - Grafikler */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCharts
            salesTrendData={salesTrend}
            customerGrowthData={customerGrowth}
            revenueByCategory={revenueByCategory}
            topProducts={topProducts}
          />
        </div>

        {/* Sağ Kolon - Son Aktiviteler */}
        <div className="space-y-6">
          {/* Son Satışlar */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Son Satışlar</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/sales">
                  <Calendar className="h-4 w-4 mr-2" />
                  Tümünü Gör
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{sale.customer_name || "Bilinmeyen Müşteri"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.sale_date).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        ₺{sale.final_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant={sale.status === "completed" ? "default" : "secondary"} className="text-xs">
                        {sale.status === "completed" ? "Tamamlandı" : sale.status === "pending" ? "Bekliyor" : "Diğer"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Henüz satış bulunmuyor</p>
              )}
            </CardContent>
          </Card>

          {/* Son Müşteriler */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Yeni Müşteriler</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/customers">
                  <Users className="h-4 w-4 mr-2" />
                  Tümünü Gör
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCustomers.length > 0 ? (
                recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(customer.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/customers/${customer.mid}`}>Görüntüle</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Henüz müşteri bulunmuyor</p>
              )}
            </CardContent>
          </Card>

          {/* Hızlı Aksiyonlar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Hızlı İşlemler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/sales/new">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Yeni Satış
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/customers/new">
                  <Users className="h-4 w-4 mr-2" />
                  Yeni Müşteri
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/products/new">
                  <Package className="h-4 w-4 mr-2" />
                  Yeni Ürün
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/financials/income/new">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Gelir Ekle
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">İş Yönetim Dashboard</h1>
        <p className="text-muted-foreground">İşletmenizin genel durumu ve performans analizi</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
