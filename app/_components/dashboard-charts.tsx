"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

type SalesGrowthData = {
  month: string
  sales: number
  customers: number
}

type CustomerGrowthData = {
  month: string
  newCustomers: number
  totalCustomers: number
}

interface DashboardChartsProps {
  salesGrowthData: SalesGrowthData[]
  customerGrowthData: CustomerGrowthData[]
}

export default function DashboardCharts({ salesGrowthData, customerGrowthData }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Aylık Satış Performansı</CardTitle>
          <CardDescription>Son 6 ayın satış adedi ve aktif müşteri sayısı</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, name === "sales" ? "Satış Adedi" : "Aktif Müşteri"]}
                labelFormatter={(label) => `Ay: ${label}`}
              />
              <Legend formatter={(value) => (value === "sales" ? "Satış Adedi" : "Aktif Müşteri")} />
              <Bar dataKey="sales" fill="#8884d8" name="sales" />
              <Bar dataKey="customers" fill="#82ca9d" name="customers" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Müşteri Büyümesi</CardTitle>
          <CardDescription>Aylık yeni müşteri kazanımı ve toplam müşteri sayısı</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, name === "newCustomers" ? "Yeni Müşteri" : "Toplam Müşteri"]}
                labelFormatter={(label) => `Ay: ${label}`}
              />
              <Legend formatter={(value) => (value === "newCustomers" ? "Yeni Müşteri" : "Toplam Müşteri")} />
              <Line type="monotone" dataKey="newCustomers" stroke="#8884d8" strokeWidth={2} name="newCustomers" />
              <Line type="monotone" dataKey="totalCustomers" stroke="#82ca9d" strokeWidth={2} name="totalCustomers" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
