"use client"

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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {/* Sales Trend */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Satış Trendi</CardTitle>
          <CardDescription>Son 6 ayın satış performansı</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: { label: "Satış Adedi", color: "hsl(var(--chart-1))" },
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

      {/* Customer Growth */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Müşteri Büyümesi</CardTitle>
          <CardDescription>Aylık yeni müşteri kazanımı</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              newCustomers: { label: "Yeni Müşteriler", color: "hsl(var(--chart-3))" },
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
          <ChartContainer config={{ sales: { label: "Satış", color: "hsl(var(--chart-5))" } }} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
