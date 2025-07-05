"use client"

import {
  Bar,
  BarChart,
  Line,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  Cell,
  Sector,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrencyTR } from "@/lib/utils"
import { useState, useCallback } from "react"

// --- Prop Types ---
type PerformanceTrend = { month: string; revenue: number; newCustomers: number }
type RevenueCategory = { category: string; value: number; color: string }
type TopProduct = { name: string; sales: number; revenue: number }

interface DashboardChartsProps {
  performanceTrendData: PerformanceTrend[]
  revenueByCategory: RevenueCategory[]
  topProducts: TopProduct[]
}

// --- Custom Pie Chart Shape ---
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? "start" : "end"

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-sm">
        {payload.category}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
        {formatCurrencyTR(value)}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  )
}

// --- Main Component ---
export default function DashboardCharts({
  performanceTrendData,
  revenueByCategory,
  topProducts,
}: DashboardChartsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const onPieEnter = useCallback((_: any, index: number) => setActiveIndex(index), [setActiveIndex])

  const chartConfig = {
    revenue: { label: "Gelir", color: "hsl(var(--chart-1))" },
    newCustomers: { label: "Yeni Müşteriler", color: "hsl(var(--chart-2))" },
    topProductRevenue: { label: "Gelir", color: "hsl(var(--chart-3))" },
  }

  return (
    <>
      {/* Performance Trend Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Aylık Performans Trendi</CardTitle>
          <CardDescription>Son 6 ayın gelir ve yeni müşteri grafiği.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ComposedChart data={performanceTrendData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="var(--color-revenue)"
                tickFormatter={(val) => formatCurrencyTR(val, "TRY", 0)}
                fontSize={12}
              />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-newCustomers)" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="newCustomers" yAxisId="right" fill="var(--color-newCustomers)" radius={4} />
              <Line
                type="monotone"
                dataKey="revenue"
                yAxisId="left"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Category */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Kategoriye Göre Gelir</CardTitle>
            <CardDescription>Gelir kaynaklarının dağılımı.</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByCategory.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {revenueByCategory.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Gelir verisi bulunamadı.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>En Çok Satan Ürünler</CardTitle>
            <CardDescription>Gelire göre en iyi 5 ürün.</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis
                      type="number"
                      dataKey="revenue"
                      tickFormatter={(val) => formatCurrencyTR(val, "TRY", 0)}
                      fontSize={12}
                    />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} interval={0} />
                    <ChartTooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="revenue" fill="var(--color-topProductRevenue)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Ürün satış verisi bulunamadı.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
