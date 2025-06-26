import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Calendar, User, CreditCard, FileText, CheckCircle, Clock, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns" // isBefore ve startOfDay eklendi (parseISO zaten vardı)
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SaleStatusActions } from "./_components/sale-status-actions"
import { DeleteSaleDialog } from "./_components/delete-sale-dialog"
import { InstallmentActionButton } from "./_components/installment-action-button" // Yeni bileşeni import et
// updateOverdueInstallmentsAction import edilecek
import { updateOverdueInstallmentsAction } from "../new/_actions/sales-actions"

// Satış verisi için tip tanımı
type PaymentInstallment = {
  id: number
  due_date: string // ISO date string
  amount: number
  status: string // 'pending', 'paid', 'overdue'
  paid_at: string | null
}

type SaleDetail = {
  id: number
  sale_date: string
  customer_mid: string | null
  total_amount: number // Bu, satışın ana para birimindeki toplamıdır (şimdilik TRY varsayıyoruz)
  discount_amount: number // Bu da
  tax_amount: number // Bu da
  final_amount: number // Bu da
  payment_method: string | null
  status: string
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
    unit_price: number // Bu, ürünün kendi para birimindeki fiyatıdır
    vat_rate: number
    item_total_gross: number // Bu, ürünün kendi para birimindeki KDV'siz toplamıdır
    item_total_net: number // Bu, ürünün kendi para birimindeki KDV'li toplamıdır
    products: {
      name: string
      sale_price_currency: string | null // Ürünün satış para birimi
    }
  }[]
  payment_installments?: PaymentInstallment[]
}

// Satış durumuna göre badge rengi
const getStatusBadgeVariant = (status: string): "success" | "warning" | "destructive" | "outline" | "secondary" => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success"
    case "pending":
    case "pending_installment":
      return "warning"
    case "cancelled":
      return "destructive"
    case "refunded":
      return "outline"
    default:
      return "secondary"
  }
}

// Satış durumunu Türkçe'ye çevir
const formatStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "Tamamlandı"
    case "pending":
      return "Beklemede"
    case "pending_installment":
      return "Taksit Bekleniyor"
    case "cancelled":
      return "İptal Edildi"
    case "refunded":
      return "İade Edildi"
    default:
      return status
  }
}

// Taksit durumunu Türkçe'ye çevir ve ikon ekle
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

// Ödeme yöntemini Türkçe'ye çevir
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

  // Önce gecikmiş taksitleri güncelle (sayfa yüklenirken)
  // Bu işlem revalidatePath yapacağı için, aşağıdaki veri çekme işlemi güncel veriyi alacaktır.
  // Ancak, bu eylemin sonucunu doğrudan kullanmayacağımız için,
  // ve revalidatePath'in hemen etkili olmasını beklediğimiz için bu şekilde bırakabiliriz.
  // Alternatif olarak, bu eylemden sonra veriyi tekrar çekmek düşünülebilir ama revalidatePath yeterli olmalı.
  const overdueUpdateResult = await updateOverdueInstallmentsAction(saleId)
  if (!overdueUpdateResult.success) {
    console.warn("Gecikmiş taksitler güncellenirken bir sorun oluştu:", overdueUpdateResult.error)
    // Bu kritik bir hata değilse sayfanın yüklenmesine devam edilebilir.
  } else if (overdueUpdateResult.updatedCount > 0) {
    console.log(`${overdueUpdateResult.updatedCount} adet taksit 'gecikti' olarak işaretlendi.`)
    // Revalidation tetiklendiği için veri zaten güncel gelecek.
  }

  const { data: sale, error } = await supabase
    .from("sales")
    .select(
      `
  *,
  customers (
    contact_name,
    email,
    phone
  ),
  sale_items (
    id,
    product_stock_code,
    quantity,
    unit_price,
    vat_rate,
    item_total_gross,
    item_total_net,
    products (
      name,
      sale_price_currency 
    )
  ),
  payment_installments (
    id,
    due_date,
    amount,
    status,
    paid_at
  )
`,
    )
    .eq("id", saleId)
    .is("deleted_at", null)
    .single()

  if (error || !sale) {
    console.error("Error fetching sale details or sale is archived:", error?.message)
    notFound()
  }

  const typedSale = sale as SaleDetail

  // Helper to format currency
  const formatCurrency = (amount: number, currencyCode: string | null | undefined) => {
    const code = currencyCode || "TRY" // Varsayılan TRY
    try {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: code, minimumFractionDigits: 2 }).format(
        amount,
      )
    } catch (e) {
      // Desteklenmeyen para birimi kodu durumunda
      return `${amount.toFixed(2)} ${code}`
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/sales">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Satışlara Geri Dön
          </Button>
        </Link>
        <div className="flex gap-2">
          <SaleStatusActions saleId={typedSale.id} currentStatus={typedSale.status} />
          <DeleteSaleDialog saleId={typedSale.id} />
          <Link href={`/sales/${typedSale.id}/invoice`}>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" /> Faturayı Görüntüle
            </Button>
          </Link>
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
                  Satış Tarihi: {format(new Date(typedSale.sale_date), "dd.MM.yyyy HH:mm")}
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
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price, item.products.sale_price_currency)}
                    </TableCell>
                    <TableCell className="text-right">{(item.vat_rate * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.item_total_net, item.products.sale_price_currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Taksit Bilgileri */}
          {typedSale.is_installment && typedSale.payment_installments && typedSale.payment_installments.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4 border-t pt-6">
                Ödeme Planı ({typedSale.installment_count} Taksit)
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Vade Tarihi</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="text-center">Durum</TableHead>
                    <TableHead>Ödenme Tarihi</TableHead>
                    <TableHead className="text-right">İşlem</TableHead> {/* YENİ SÜTUN */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typedSale.payment_installments.map((inst, index) => (
                    <TableRow key={inst.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{format(parseISO(inst.due_date), "dd.MM.yyyy")}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inst.amount, "TRY")}</TableCell>
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
          <div className="ml-auto w-full max-w-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ara Toplam:</span>
                <span>{formatCurrency(typedSale.total_amount, "TRY")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KDV:</span>
                <span>{formatCurrency(typedSale.tax_amount, "TRY")}</span>
              </div>
              {typedSale.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">İndirim:</span>
                  <span>-{formatCurrency(typedSale.discount_amount, "TRY")}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold">
                <span>Genel Toplam:</span>
                <span>{formatCurrency(typedSale.final_amount, "TRY")}</span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
