import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Calendar, User, CreditCard, FileText, CheckCircle, Clock, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SaleStatusActions } from "./_components/sale-status-actions"
import { DeleteSaleDialog } from "./_components/delete-sale-dialog"
import { InstallmentActionButton } from "./_components/installment-action-button"
import { updateOverdueInstallmentsAction } from "../new/_actions/sales-actions"

type PaymentInstallment = {
  id: number
  due_date: string
  amount: number
  status: string
  paid_at: string | null
}

type SaleDetail = {
  id: number
  sale_date: string
  customer_mid: string | null
  total_amount: number
  discount_amount: number
  tax_amount: number
  final_amount: number
  payment_method: string | null
  status: string
  sale_currency: string
  notes: string | null
  created_at: string
  updated_at: string
  is_installment: boolean | null
  installment_count: number | null
  customers?: {
    contact_name: string | null
    email: string | null
    phone: string | null
  } | null
  sale_items: {
    id: number
    product_stock_code: string
    quantity: number
    unit_price: number
    vat_rate: number
    item_total_net: number
    products: {
      name: string
    }
  }[]
  payment_installments?: PaymentInstallment[]
}

const getStatusBadgeVariant = (status: string): "success" | "warning" | "destructive" | "outline" | "secondary" => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success"
    case "pending":
      return "warning"
    case "cancelled":
      return "destructive"
    case "refunded":
      return "outline"
    default:
      return "secondary"
  }
}

const formatStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "Tamamlandı"
    case "pending":
      return "Beklemede"
    case "cancelled":
      return "İptal Edildi"
    case "refunded":
      return "İade Edildi"
    default:
      return status
  }
}

const formatInstallmentStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return (
        <Badge variant="success" className="text-xs">
          <CheckCircle className="mr-1 h-3 w-3" /> Ödendi
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="warning" className="text-xs">
          <Clock className="mr-1 h-3 w-3" /> Bekliyor
        </Badge>
      )
    case "overdue":
      return (
        <Badge variant="destructive" className="text-xs">
          <XCircle className="mr-1 h-3 w-3" /> Gecikti
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="text-xs">
          {status}
        </Badge>
      )
  }
}

const formatPaymentMethod = (method: string | null) => {
  if (!method) return "-"
  switch (method.toLowerCase()) {
    case "cash":
      return "Nakit"
    case "credit_card":
      return "Kredi Kartı"
    case "bank_transfer":
      return "Banka Havalesi"
    case "other":
      return "Diğer"
    default:
      return method
  }
}

export default async function SaleDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const saleId = Number.parseInt(params.id)

  if (isNaN(saleId)) {
    notFound()
  }

  await updateOverdueInstallmentsAction(saleId)

  const { data: sale, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      customers (contact_name, email, phone),
      sale_items (
        id, product_stock_code, quantity, unit_price, vat_rate, item_total_net,
        products (name)
      ),
      payment_installments (id, due_date, amount, status, paid_at)
    `,
    )
    .eq("id", saleId)
    .is("deleted_at", null)
    .single()

  if (error || !sale) {
    console.error("Error fetching sale details:", error?.message)
    notFound()
  }

  const typedSale = sale as SaleDetail

  const formatCurrency = (amount: number) => {
    const code = typedSale.sale_currency || "TRY"
    try {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: code, minimumFractionDigits: 2 }).format(
        amount,
      )
    } catch (e) {
      return `${amount.toFixed(2)} ${code}`
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/sales">
            <ArrowLeft className="mr-2 h-4 w-4" /> Satışlara Geri Dön
          </Link>
        </Button>
        <div className="flex gap-2">
          <SaleStatusActions saleId={typedSale.id} currentStatus={typedSale.status} />
          <DeleteSaleDialog saleId={typedSale.id} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/sales/${typedSale.id}/invoice`}>
              <FileText className="mr-2 h-4 w-4" /> Faturayı Görüntüle
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-muted/50 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">Satış #{typedSale.id}</CardTitle>
              <CardDescription className="text-md flex items-center mt-1">
                <Calendar className="mr-1 h-4 w-4" />
                {format(new Date(typedSale.sale_date), "dd.MM.yyyy HH:mm")}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(typedSale.status)} className="text-sm whitespace-nowrap">
              {formatStatus(typedSale.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Müşteri Bilgileri</h3>
              {typedSale.customers ? (
                <div className="space-y-1">
                  <p className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Link href={`/customers/${typedSale.customer_mid}`} className="hover:underline">
                      {typedSale.customers.contact_name}
                    </Link>
                  </p>
                  {typedSale.customers.email && (
                    <p className="text-sm text-muted-foreground">{typedSale.customers.email}</p>
                  )}
                  {typedSale.customers.phone && (
                    <p className="text-sm text-muted-foreground">{typedSale.customers.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Misafir Satışı</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Ödeme Bilgileri</h3>
              <div className="space-y-1">
                <p className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                  {formatPaymentMethod(typedSale.payment_method)}
                  {typedSale.is_installment && typedSale.installment_count && (
                    <Badge variant="outline" className="ml-2">
                      {typedSale.installment_count} Taksit
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Para Birimi: <strong>{typedSale.sale_currency}</strong>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Satış Kalemleri</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead className="text-right">Miktar</TableHead>
                  <TableHead className="text-right">Birim Fiyat</TableHead>
                  <TableHead className="text-right">KDV</TableHead>
                  <TableHead className="text-right">Toplam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typedSale.sale_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link href={`/products/${item.product_stock_code}`} className="hover:underline">
                        {item.products.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">SKU: {item.product_stock_code}</div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right">{(item.vat_rate * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.item_total_net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {typedSale.is_installment && typedSale.payment_installments && typedSale.payment_installments.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4 border-t pt-6">Ödeme Planı</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Vade Tarihi</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="text-center">Durum</TableHead>
                    <TableHead>Ödenme Tarihi</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typedSale.payment_installments.map((inst, index) => (
                    <TableRow key={inst.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{format(parseISO(inst.due_date), "dd.MM.yyyy")}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inst.amount)}</TableCell>
                      <TableCell className="text-center">{formatInstallmentStatus(inst.status)}</TableCell>
                      <TableCell>{inst.paid_at ? format(new Date(inst.paid_at), "dd.MM.yyyy HH:mm") : "-"}</TableCell>
                      <TableCell className="text-right">
                        <InstallmentActionButton
                          installmentId={inst.id}
                          currentStatus={inst.status}
                          saleId={typedSale.id}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {typedSale.notes && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-2">Notlar</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{typedSale.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 p-6 border-t">
          <div className="ml-auto w-full max-w-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ara Toplam:</span>
              <span>{formatCurrency(typedSale.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">KDV:</span>
              <span>{formatCurrency(typedSale.tax_amount)}</span>
            </div>
            {typedSale.discount_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">İndirim:</span>
                <span>-{formatCurrency(typedSale.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-bold text-lg">
              <span>Genel Toplam:</span>
              <span>{formatCurrency(typedSale.final_amount)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
