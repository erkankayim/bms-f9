"use client"

import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type SalesTrend = { month: string; sales: number; revenue: number }
type CustomerGrowth = { month: string; newCustomers: number; totalCustomers: number }
type RevenueCategory = { category: string; value: number; color: string }
type TopProduct = { name: string; sales: number; revenue: number }

interface DashboardChartsProps {
  salesTrendData: SalesTrend[]
  customerGrowthData: CustomerGrowth[]
  revenueByCategory: RevenueCategory[]
  topProducts: TopProduct[]
}

export default function DashboardCharts({
  salesTrendData,
  customerGrowthData,
  revenueByCategory,
  topProducts,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Satış Trendi - Area Chart */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📈 Satış Trendi</CardTitle>
          <CardDescription>Son 6 ayın satış performansı ve gelir analizi</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: { label: "Satış Adedi", color: "hsl(var(--chart-1))" },
              revenue: { label: "Gelir (TL)", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === "revenue" ? `₺${Number(value).toLocaleString("tr-TR")}` : value,
                    name === "sales" ? "Satış Adedi" : "Gelir",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-sales)"
                  fillOpacity={0.6}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Müşteri Büyümesi */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">👥 Müşteri Büyümesi</CardTitle>
          <CardDescription>Aylık yeni müşteri kazanımı ve toplam müşteri sayısı</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              newCustomers: { label: "Yeni Müşteriler", color: "hsl(var(--chart-3))" },
              totalCustomers: { label: "Toplam Müşteri", color: "hsl(var(--chart-4))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="newCustomers" fill="var(--color-newCustomers)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Kategoriye Göre Gelir */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🎯 Gelir Dağılımı</CardTitle>
          <CardDescription>Kategorilere göre gelir analizi</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ value: { label: "Gelir", color: "hsl(var(--chart-4))" } }} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueByCategory.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`₺${Number(value).toLocaleString("tr-TR")}`, "Gelir"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* En Çok Satan Ürünler */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🏆 En Çok Satan Ürünler</CardTitle>
          <CardDescription>Satış performansına göre sıralama</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ sales: { label: "Satış", color: "hsl(var(--chart-5))" } }} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${value} adet`, "Satış Miktarı"]}
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
