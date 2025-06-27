import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Briefcase,
} from "lucide-react"
import { getDashboardStats, getRecentSales, getRecentCustomers } from "./_actions/dashboard-actions"
import { Badge } from "@/components/ui/badge"
import { formatCurrencyTR, formatSimpleDateTR, getSaleStatusBadgeVariant, formatSaleStatusTR } from "@/lib/utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
} from "recharts"

export const dynamic = "force-dynamic"

// Mock data for charts - in real app, this would come from your database
const salesTrendData = [
  { month: "Oca", sales: 45, revenue: 12500 },
  { month: "Şub", sales: 52, revenue: 15200 },
  { month: "Mar", sales: 48, revenue: 13800 },
  { month: "Nis", sales: 61, revenue: 18400 },
  { month: "May", sales: 55, revenue: 16200 },
  { month: "Haz", sales: 67, revenue: 19800 },
]

const customerGrowthData = [
  { month: "Oca", newCustomers: 12, totalCustomers: 145 },
  { month: "Şub", newCustomers: 15, totalCustomers: 160 },
  { month: "Mar", newCustomers: 8, totalCustomers: 168 },
  { month: "Nis", newCustomers: 22, totalCustomers: 190 },
  { month: "May", newCustomers: 18, totalCustomers: 208 },
  { month: "Haz", newCustomers: 25, totalCustomers: 233 },
]

const revenueByCategory = [
  { category: "Ürün Satışı", value: 45000, color: "#0088FE" },
  { category: "Hizmet", value: 28000, color: "#00C49F" },
  { category: "Abonelik", value: 15000, color: "#FFBB28" },
  { category: "Diğer", value: 8000, color: "#FF8042" },
]

const topProducts = [
  { name: "Premium Paket", sales: 45, revenue: 22500 },
  { name: "Standart Hizmet", sales: 38, revenue: 15200 },
  { name: "Teknik Destek", sales: 32, revenue: 9600 },
  { name: "Özel Çözüm", sales: 28, revenue: 14000 },
  { name: "Bakım Hizmeti", sales: 25, revenue: 7500 },
]

export default async function DashboardPage() {
  const [statsResult, recentSalesResult, recentCustomersResult] = await Promise.all([
    getDashboardStats(),
    getRecentSales(5),
    getRecentCustomers(3),
  ])

  const stats = statsResult.data
  const recentSales = recentSalesResult.data
  const recentCustomers = recentCustomersResult.data

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
      value: formatCurrencyTR(stats.totalRevenue, stats.currency),
      icon: DollarSign,
      description: "Onaylanmış satış geliri.",
    },
    {
      title: "Ort. Satış Değeri",
      value: formatCurrencyTR(stats.averageSaleValue, stats.currency),
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
          <div className="flex items-center space-x-2">
            <Button asChild size="sm" className="whitespace-nowrap">
              <Link href="/sales/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Yeni Satış Oluştur
              </Link>
            </Button>
          </div>
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

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {/* Sales Trend Chart */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Satış Trendi</CardTitle>
              <CardDescription>Son 6 ayın satış performansı</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: "Satış Adedi",
                    color: "hsl(var(--chart-1))",
                  },
                  revenue: {
                    label: "Gelir",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Customer Growth Chart */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Müşteri Büyümesi</CardTitle>
              <CardDescription>Aylık yeni müşteri kazanımı</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  newCustomers: {
                    label: "Yeni Müşteriler",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="newCustomers" fill="var(--color-newCustomers)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Revenue by Category */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Kategoriye Göre Gelir</CardTitle>
              <CardDescription>Gelir dağılımı analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Gelir",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>En Çok Satan Ürünler</CardTitle>
              <CardDescription>Satış performansına göre sıralama</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: "Satış",
                    color: "hsl(var(--chart-5))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Sales */}
          <Card className="lg:col-span-4 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Son Satışlar</CardTitle>
                <CardDescription>En son yapılan 5 satış işlemi.</CardDescription>
              </div>
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
                          {formatCurrencyTR(sale.final_amount, stats.currency)}
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

          {/* Quick Actions & Recent Customers */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {[
                  { href: "/customers/new", label: "Yeni Müşteri", icon: UserPlus },
                  { href: "/products/new", label: "Yeni Ürün", icon: PackagePlus },
                  { href: "/inventory", label: "Envanter", icon: ListChecks },
                  { href: "/invoices/new", label: "Yeni Fatura", icon: FileText },
                  { href: "/financials", label: "Finansallar", icon: Briefcase },
                ].map((action) => (
                  <Button
                    key={action.href}
                    variant="outline"
                    className="w-full justify-start text-sm bg-transparent"
                    asChild
                  >
                    <Link href={action.href}>
                      <action.icon className="mr-2 h-4 w-4" /> {action.label}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Yeni Müşteriler</CardTitle>
                  <CardDescription>En son eklenen 3 müşteri.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/customers">
                    Tüm Müşteriler <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentCustomers && recentCustomers.length > 0 ? (
                  <ul className="space-y-4">
                    {recentCustomers.map((customer) => (
                      <li key={customer.mid} className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/customers/${customer.mid}`}
                            className="font-medium hover:underline truncate block"
                            title={customer.name}
                          >
                            {customer.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Kayıt: {formatSimpleDateTR(customer.created_at)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 flex-shrink-0">
                          <Link href={`/customers/${customer.mid}`} title="Müşteri Detayları">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Henüz müşteri kaydı bulunmamaktadır.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
