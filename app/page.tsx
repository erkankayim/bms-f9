import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  ListChecks,
  UserPlus,
  PackagePlus,
  FileText,
  Warehouse,
  AlertTriangle,
} from "lucide-react"
import {
  getDashboardStats,
  getRecentSales,
  getPerformanceTrendData,
  getRevenueByCategory,
  getTopProducts,
  getLowStockProducts,
} from "./_actions/dashboard-actions"
import { Badge } from "@/components/ui/badge"
import { formatCurrencyTR, formatSimpleDateTR, getSaleStatusBadgeVariant, formatSaleStatusTR } from "@/lib/utils"
import DashboardCharts from "./_components/dashboard-charts"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [
    statsResult,
    recentSalesResult,
    performanceTrendResult,
    revenueByCategoryResult,
    topProductsResult,
    lowStockProductsResult,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentSales(5),
    getPerformanceTrendData(),
    getRevenueByCategory(),
    getTopProducts(5),
    getLowStockProducts(5),
  ])

  const stats = statsResult.data
  const recentSales = recentSalesResult.data
  const performanceTrendData = performanceTrendResult.data || []
  const revenueByCategory = revenueByCategoryResult.data || []
  const topProducts = topProductsResult.data || []
  const lowStockProducts = lowStockProductsResult.data || []

  if (statsResult.error || !stats) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-destructive">Kontrol Paneli Yüklenemedi</h2>
        <p className="text-muted-foreground">{statsResult.error || "Veriler alınırken bir sorun oluştu."}</p>
        <Button asChild className="mt-6">
          <Link href="/">Tekrar Dene</Link>
        </Button>
      </div>
    )
  }

  const kpiCards = [
    {
      title: "Toplam Müşteri",
      value: stats.totalCustomers.toString(),
      icon: Users,
      description: "Kayıtlı aktif müşteri.",
    },
    {
      title: "Toplam Ürün",
      value: stats.totalProducts.toString(),
      icon: Package,
      description: "Sistemdeki ürün çeşidi.",
    },
    {
      title: "Toplam Satış",
      value: stats.totalSales.toString(),
      icon: ShoppingCart,
      description: "Gerçekleşen satış adedi.",
    },
    {
      title: "Toplam Gelir",
      value: formatCurrencyTR(stats.totalRevenue),
      icon: DollarSign,
      description: "Onaylanmış satış geliri.",
    },
    {
      title: "Ort. Satış Değeri",
      value: formatCurrencyTR(stats.averageSaleValue),
      icon: TrendingUp,
      description: "Satış başına ortalama.",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <main className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kontrol Paneli</h1>
            <p className="text-sm text-muted-foreground">İşletmenizin genel durumuna hızlı bir bakış.</p>
          </div>
          <Button asChild size="sm" className="whitespace-nowrap">
            <Link href="/sales/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Yeni Satış Oluştur
            </Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {kpiCards.map((kpi) => (
            <Card key={kpi.title} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground pt-1">{kpi.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DashboardCharts
              performanceTrendData={performanceTrendData}
              revenueByCategory={revenueByCategory}
              topProducts={topProducts}
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Düşük Stok Uyarıları</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/inventory/alerts">
                    Tümü <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length > 0 ? (
                  <ul className="space-y-4">
                    {lowStockProducts.map((p) => (
                      <li key={p.stock_code} className="flex items-center gap-4">
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${p.stock_code}`}
                            className="font-medium hover:underline truncate block text-sm"
                            title={p.name}
                          >
                            {p.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Kalan: <span className="font-semibold text-destructive">{p.quantity}</span> / Eşik:{" "}
                            {p.low_stock_threshold}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 flex-shrink-0">
                          <Link href={`/products/${p.stock_code}`} title="Ürün Detayları">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListChecks className="mx-auto h-10 w-10 mb-2" />
                    <p className="text-sm font-medium">Tüm stoklar yolunda!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  { href: "/customers/new", label: "Yeni Müşteri", icon: UserPlus },
                  { href: "/products/new", label: "Yeni Ürün", icon: PackagePlus },
                  { href: "/inventory/adjust", label: "Stok Ayarla", icon: Warehouse },
                  { href: "/invoices/new", label: "Yeni Fatura", icon: FileText },
                ].map((a) => (
                  <Button
                    key={a.href}
                    variant="outline"
                    className="w-full justify-start text-sm bg-transparent"
                    asChild
                  >
                    <Link href={a.href}>
                      <a.icon className="mr-2 h-4 w-4" /> {a.label}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Son Satışlar</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/sales">
                Tüm Satışlar <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentSales && recentSales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead className="hidden sm:table-cell">Tarih</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="text-right w-[80px]">Detay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div
                          className="font-medium truncate max-w-[150px] sm:max-w-xs"
                          title={sale.customer_name || undefined}
                        >
                          {sale.customer_name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatSimpleDateTR(sale.sale_date)}</TableCell>
                      <TableCell>
                        <Badge variant={getSaleStatusBadgeVariant(sale.status)} className="whitespace-nowrap">
                          {formatSaleStatusTR(sale.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatCurrencyTR(sale.final_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <Link href={`/sales/${sale.id}`} title="Satış Detayları">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Henüz satış kaydı bulunmamaktadır.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
