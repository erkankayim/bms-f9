import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Eye, ShoppingCart } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { Sale } from "./helpers"

async function getCustomerSales(customerId: string): Promise<Sale[]> {
  const supabase = createClient()

  const { data: sales, error } = await supabase
    .from("sales")
    .select("id, sale_date, total_amount, status")
    .eq("customer_id", customerId)
    .order("sale_date", { ascending: false })

  if (error) {
    console.error("Error fetching sales:", error?.message)
    return []
  }

  return sales as Sale[]
}

export default async function CustomerSalesHistory({ customerId }: { customerId: string }) {
  const sales = await getCustomerSales(customerId)

  if (!sales || sales.length === 0) {
    return (
      <Alert>
        <ShoppingCart className="h-4 w-4" />
        <AlertTitle>Satış Geçmişi Yok</AlertTitle>
        <AlertDescription>Bu müşteri için henüz bir satış kaydedilmemiş.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Satış Geçmişi</CardTitle>
        <CardDescription>Bu müşteriye yapılan tüm satışların listesi.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Satış ID</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead className="text-center">İncele</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.id || "-"}</TableCell>
                <TableCell>{formatDate(sale.sale_date)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {sale.status || "Bilinmiyor"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(sale.total_amount ?? 0)}</TableCell>
                <TableCell className="text-center">
                  <Button asChild variant="outline" size="icon" disabled={!sale.id}>
                    <Link href={`/sales/${sale.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
