"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrencyTR } from "@/lib/utils"

type MonthlyRevenue = { month: string; revenue: number }
type TopProduct = { name: string; totalSold: number; revenue: number }

interface DashboardChartsProps {
  monthlyRevenue: MonthlyRevenue[]
  topProducts: TopProduct[]
}

export default function DashboardCharts({ monthlyRevenue, topProducts }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Aylık Gelir Trendi */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Aylık Gelir Trendi</CardTitle>
          <CardDescription>Son 6 ayın gelir performansı</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: "Gelir", color: "hsl(var(--chart-1))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrencyTR(value, "TRY", 0)} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [formatCurrencyTR(value), "Gelir"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* En Çok Satan Ürünler */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>En Çok Satan Ürünler</CardTitle>
          <CardDescription>Satış adedine göre en iyi 5 ürün</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              totalSold: { label: "Satış Adedi", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="totalSold" fill="var(--color-totalSold)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
