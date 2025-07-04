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
  Legend,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3, PieChartIcon, Award } from "lucide-react"

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

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

export default function DashboardCharts({
  salesTrendData,
  customerGrowthData,
  revenueByCategory,
  topProducts,
}: DashboardChartsProps) {
  return (
    <div className="space-y-8">
      {/* Sales and Revenue Trend */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold text-slate-800 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-emerald-600" />
                Satış ve Gelir Trendi
              </CardTitle>
              <CardDescription className="text-base text-slate-600 mt-2">
                Son 6 ayın detaylı performans analizi
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any, name: string) => [
                    name === "revenue" ? `₺${Number(value).toLocaleString("tr-TR")}` : `${value} adet`,
                    name === "sales" ? "Satış Adedi" : "Gelir",
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  name="Gelir (₺)"
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#colorSales)"
                  name="Satış Adedi"
                />
              </AreaChart>
            </ResponsiveContainer>
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
            <CardDescription className="text-slate-600">Aylık yeni müşteri kazanımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar dataKey="newCustomers" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Yeni Müşteriler" />
                </BarChart>
              </ResponsiveContainer>
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
            <CardDescription className="text-slate-600">Kategorilere göre gelir analizi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    dataKey="value"
                    label={({ category, percent }) =>
                      percent > 0.05 ? `${category} ${(percent * 100).toFixed(0)}%` : ""
                    }
                    labelLine={false}
                  >
                    {revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: any) => [`₺${Number(value).toLocaleString("tr-TR")}`, "Gelir"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
          <CardDescription className="text-slate-600">Satış performansına göre sıralama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="horizontal" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any) => [`${value} adet`, "Satış Miktarı"]}
                />
                <Bar dataKey="sales" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Satış Adedi" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
