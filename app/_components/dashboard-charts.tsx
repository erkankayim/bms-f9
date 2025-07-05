"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type SalesGrowthData = { month: string; sales: number; customers: number }
type CustomerGrowthData = { month: string; newCustomers: number; totalCustomers: number }

interface DashboardChartsProps {
  salesGrowthData: SalesGrowthData[]
  customerGrowthData: CustomerGrowthData[]
}

export default function DashboardCharts({ salesGrowthData, customerGrowthData }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Aylık Satış Sayıları */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Aylık Satış Performansı</CardTitle>
          <CardDescription>Son 6 ayın satış adedi ve aktif müşteri sayısı</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: { label: "Satış Adedi", color: "hsl(var(--chart-1))" },
              customers: { label: "Aktif Müşteri", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-sales)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Satış Adedi"
                />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="var(--color-customers)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Aktif Müşteri"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Müşteri Büyümesi */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Müşteri Büyümesi</CardTitle>
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
                <Bar dataKey="newCustomers" fill="var(--color-newCustomers)" radius={4} name="Yeni Müşteriler" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
