import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Eye, FileText } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { Invoice } from "./helpers"

async function getCustomerInvoices(customerId: string): Promise<Invoice[]> {
  const supabase = createClient()

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, issue_date, total_amount, status")
    .eq("customer_id", customerId)
    .order("issue_date", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error?.message)
    return []
  }

  return invoices as Invoice[]
}

export default async function CustomerInvoiceHistory({ customerId }: { customerId: string }) {
  const invoices = await getCustomerInvoices(customerId)

  if (!invoices || invoices.length === 0) {
    return (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Fatura Geçmişi Yok</AlertTitle>
        <AlertDescription>Bu müşteri için henüz bir fatura oluşturulmamış.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fatura Geçmişi</CardTitle>
        <CardDescription>Bu müşteriye kesilen tüm faturaların listesi.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fatura No</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead className="text-center">İncele</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_number || "-"}</TableCell>
                <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {invoice.status?.replace("_", " ") || "Bilinmiyor"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.total_amount ?? 0)}</TableCell>
                <TableCell className="text-center">
                  <Button asChild variant="outline" size="icon" disabled={!invoice.id}>
                    <Link href={`/invoices/${invoice.id}`}>
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
