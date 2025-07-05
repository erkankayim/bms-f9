import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getDashboardStats,
  getRecentSales,
  getRecentCustomers,
  getSalesGrowthData,
  getCustomerGrowthData,
} from "@/app/_actions/dashboard-actions"
import { formatCurrencyTR, formatDateTR, formatSaleStatusTR, getSaleStatusBadgeVariant } from "@/lib/utils"
import { Users, Package, DollarSign, ShoppingCart } from "lucide-react"
import Link from "next/link"
import DashboardCharts from "@/app/_components/dashboard-charts"

// Loading components
function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[120px] mb-2" />
        <Skeleton className="h-3 w-[80px]" />
      </CardContent>
    </Card>
  )
}

function RecentSalesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[120px]" />
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-5 w-[60px]" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function RecentCustomersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[140px]" />
        <Skeleton className="h-4 w-[180px]" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[90px]" />
            </div>
            <Skeleton className="h-8 w-[80px]" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Data components
async function StatsCards() {
  const { data: stats, error } = await getDashboardStats()

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <p className="text-sm text-destructive">Veri yüklenemedi</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString("tr-TR")}</div>
          <p className="text-xs text-muted-foreground">Aktif müşteri sayısı</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString("tr-TR")}</div>
          <p className="text-xs text-muted-foreground">Stokta bulunan ürün</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSales.toLocaleString("tr-TR")}</div>
          <p className="text-xs text-muted-foreground">Tamamlanan satış</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrencyTR(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">Ortalama: {formatCurrencyTR(stats.averageSaleValue)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

async function RecentSalesCard() {
  const { data: recentSales, error } = await getRecentSales()

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Satışlar</CardTitle>
          <CardDescription className="text-destructive">Veri yüklenemedi: {error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!recentSales || recentSales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Satışlar</CardTitle>
          <CardDescription>Henüz satış kaydı bulunmuyor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">İlk satışınızı oluşturun</p>
            <Link href="/sales/new">
              <Button>Yeni Satış</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Satışlar</CardTitle>
        <CardDescription>En son gerçekleştirilen satışlar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{sale.customer_name || "Bilinmeyen Müşteri"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTR(sale.sale_date, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium">{formatCurrencyTR(sale.final_amount)}</p>
                <Badge variant={getSaleStatusBadgeVariant(sale.status)} className="text-xs">
                  {formatSaleStatusTR(sale.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Link href="/sales">
            <Button variant="outline" className="w-full bg-transparent">
              Tüm Satışları Görüntüle
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

async function RecentCustomersCard() {
  const { data: recentCustomers, error } = await getRecentCustomers()

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Müşteriler</CardTitle>
          <CardDescription className="text-destructive">Veri yüklenemedi: {error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!recentCustomers || recentCustomers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Müşteriler</CardTitle>
          <CardDescription>Henüz müşteri kaydı bulunmuyor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">İlk müşterinizi ekleyin</p>
            <Link href="/customers/new">
              <Button>Yeni Müşteri</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Müşteriler</CardTitle>
        <CardDescription>En son eklenen müşteriler</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCustomers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTR(customer.created_at, { day: "2-digit", month: "short" })}
                </p>
              </div>
              <Link href={`/customers/${customer.mid}`}>
                <Button variant="outline" size="sm">
                  Görüntüle
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Link href="/customers">
            <Button variant="outline" className="w-full bg-transparent">
              Tüm Müşterileri Görüntüle
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

async function ChartsSection() {
  const [salesGrowthResult, customerGrowthResult] = await Promise.all([getSalesGrowthData(), getCustomerGrowthData()])

  if (salesGrowthResult.error || customerGrowthResult.error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-destructive">
            Grafik verileri yüklenemedi: {salesGrowthResult.error || customerGrowthResult.error}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardCharts
      salesGrowthData={salesGrowthResult.data || []}
      customerGrowthData={customerGrowthResult.data || []}
    />
  )
}

export default function HomePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Kontrol Paneli</h2>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <StatsCards />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Suspense fallback={<RecentSalesSkeleton />}>
            <RecentSalesCard />
          </Suspense>
        </div>
        <div className="col-span-3">
          <Suspense fallback={<RecentCustomersSkeleton />}>
            <RecentCustomersCard />
          </Suspense>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        }
      >
        <ChartsSection />
      </Suspense>
    </div>
  )
}
