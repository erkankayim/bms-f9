import { createClient } from "@/lib/supabase/server"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DollarSign, ShoppingCart, Calendar, BarChart2 } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { PurchaseInsights } from "./helpers"

const InsightCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
)

async function getCustomerInsights(customerId: string): Promise<PurchaseInsights | null> {
  const supabase = createClient()

  // Get sales data for insights
  const { data: sales, error } = await supabase
    .from("sales")
    .select("total_amount, sale_date")
    .eq("customer_id", customerId)
    .not("total_amount", "is", null)

  if (error) {
    console.error("Error fetching sales for insights:", error?.message)
    return null
  }

  if (!sales || sales.length === 0) {
    return null
  }

  const totalSpending = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
  const totalOrders = sales.length
  const sortedDates = sales.map((s) => s.sale_date).sort()
  const firstPurchaseDate = sortedDates[0] || null
  const lastPurchaseDate = sortedDates[sortedDates.length - 1] || null

  return {
    total_spending: totalSpending,
    total_orders: totalOrders,
    first_purchase_date: firstPurchaseDate,
    last_purchase_date: lastPurchaseDate,
  }
}

export default async function CustomerPurchaseInsights({ customerId }: { customerId: string }) {
  const insights = await getCustomerInsights(customerId)

  if (!insights) {
    return (
      <Alert>
        <BarChart2 className="h-4 w-4" />
        <AlertTitle>Öngörü Verisi Yok</AlertTitle>
        <AlertDescription>
          Bu müşteri için satın alma öngörüleri oluşturulacak yeterli veri bulunmuyor.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <InsightCard
        title="Toplam Harcama"
        value={formatCurrency(insights.total_spending)}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <InsightCard
        title="Toplam Sipariş"
        value={insights.total_orders}
        icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
      />
      <InsightCard
        title="İlk Alışveriş"
        value={insights.first_purchase_date ? formatDate(insights.first_purchase_date) : "-"}
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
      />
      <InsightCard
        title="Son Alışveriş"
        value={insights.last_purchase_date ? formatDate(insights.last_purchase_date) : "-"}
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}
