import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getInvoices } from "./_actions/invoice-actions"
import { Plus, FileText, Eye } from "lucide-react"

const STATUS_LABELS = {
  draft: "Taslak",
  sent: "Gönderildi",
  paid: "Ödendi",
  partially_paid: "Kısmen Ödendi",
  overdue: "Vadesi Geçmiş",
  cancelled: "İptal Edildi",
}

const STATUS_COLORS = {
  draft: "secondary",
  sent: "default",
  paid: "success",
  partially_paid: "warning",
  overdue: "destructive",
  cancelled: "secondary",
} as const

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Faturalar</h1>
          <p className="text-muted-foreground">Gelen ve giden faturaları yönetin</p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Fatura
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Fatura Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.invoice_type === "outgoing" ? "default" : "secondary"}>
                        {invoice.invoice_type === "outgoing" ? "Giden" : "Gelen"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.invoice_type === "outgoing"
                        ? invoice.customers?.service_name || "Bilinmiyor"
                        : invoice.suppliers?.name || "Bilinmiyor"}
                    </TableCell>
                    <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                    <TableCell>{formatCurrency(Number.parseFloat(invoice.total_amount))}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[invoice.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[invoice.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/invoices/${invoice.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Görüntüle
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz fatura yok</h3>
              <p className="text-muted-foreground mb-4">İlk faturanızı oluşturmak için başlayın</p>
              <Link href="/invoices/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Fatura Oluştur
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
