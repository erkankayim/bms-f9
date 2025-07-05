import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Building,
  Eye,
  ShoppingCart,
  FileText,
  BarChart2,
  DollarSign,
} from "lucide-react"
import { format } from "date-fns"
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils"

// Type definitions
interface Customer {
  mid: string
  contact_name: string | null
  company_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country: string | null
  customer_group: string | null
  balance: number | null
  notes: string | null
  service_name: string | null
  tax_number: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface Sale {
  id: string
  sale_date: string
  total_amount: number | null
  status: string | null
}

interface Invoice {
  id: string
  invoice_number: string | null
  issue_date: string
  total_amount: number | null
  status: string | null
}

interface PurchaseInsights {
  total_spending: number
  total_orders: number
  first_purchase_date: string | null
  last_purchase_date: string | null
}

// Helper component for displaying info items
function InfoItem({
  label,
  value,
  children,
}: {
  label: string
  value?: string | null
  children?: React.ReactNode
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="mt-1 text-sm text-gray-900">{children || value || "-"}</div>
    </div>
  )
}

// Insight card component
function InsightCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
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
}

// Customer Overview Component
function CustomerOverview({ customer }: { customer: Customer }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Müşteri Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <InfoItem label="Müşteri ID" value={customer.mid} />
          <InfoItem label="Yetkili Adı" value={customer.contact_name} />
          <InfoItem label="Email" value={customer.email} />
          <InfoItem label="Telefon" value={customer.phone} />
          <InfoItem label="Hizmet/Abonelik" value={customer.service_name} />
          <InfoItem label="Müşteri Grubu">
            {customer.customer_group ? <Badge variant="secondary">{customer.customer_group}</Badge> : "-"}
          </InfoItem>
          <InfoItem label="Bakiye">{formatCurrency(customer.balance ?? 0)}</InfoItem>
        </div>

        <h3 className="text-lg font-semibold border-t pt-4 mt-4">Adres Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <InfoItem label="Adres" value={customer.address} />
          <InfoItem label="Şehir" value={customer.city} />
          <InfoItem label="İl/Eyalet" value={customer.province} />
          <InfoItem label="Posta Kodu" value={customer.postal_code} />
          <InfoItem label="Ülke" value={customer.country} />
        </div>

        {customer.notes && (
          <>
            <h3 className="text-lg font-semibold border-t pt-4 mt-4">Notlar</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 mt-4 text-sm text-muted-foreground">
          <InfoItem label="Oluşturulma Tarihi" value={formatDateTime(customer.created_at)} />
          <InfoItem label="Son Güncelleme" value={formatDateTime(customer.updated_at)} />
        </div>
      </CardContent>
    </Card>
  )
}

// Sales History Component
function CustomerSalesHistory({ sales }: { sales: Sale[] }) {
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

// Invoice History Component
function CustomerInvoiceHistory({ invoices }: { invoices: Invoice[] }) {
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

// Purchase Insights Component
function CustomerPurchaseInsights({ insights }: { insights: PurchaseInsights | null }) {
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

// Main Page Component
export default async function CustomerDetailPage({ params }: { params: { mid: string } }) {
  const supabase = createClient()
  const customerId = params.mid

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch customer data
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("mid", customerId)
    .single()

  if (customerError || !customer) {
    console.error("Error fetching customer:", customerError?.message)
    notFound()
  }

  const typedCustomer = customer as Customer
  const isDeleted = !!typedCustomer.deleted_at

  // Fetch sales data
  const { data: sales = [] } = await supabase
    .from("sales")
    .select("id, sale_date, total_amount, status")
    .eq("customer_id", customerId)
    .order("sale_date", { ascending: false })

  // Fetch invoices data
  const { data: invoices = [] } = await supabase
    .from("invoices")
    .select("id, invoice_number, issue_date, total_amount, status")
    .eq("customer_id", customerId)
    .order("issue_date", { ascending: false })

  // Calculate insights
  const insights: PurchaseInsights | null =
    sales.length > 0
      ? {
          total_spending: sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0),
          total_orders: sales.length,
          first_purchase_date: sales[sales.length - 1]?.sale_date || null,
          last_purchase_date: sales[0]?.sale_date || null,
        }
      : null

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/customers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Müşterilere Geri Dön
          </Button>
        </Link>
        <div className="flex gap-2">
          {!isDeleted && (
            <Link href={`/customers/${typedCustomer.mid}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Düzenle
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-muted/50 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <User className="h-8 w-8" />
                {typedCustomer.contact_name || typedCustomer.company_name || "İsimsiz Müşteri"}
              </CardTitle>
              <CardDescription className="text-md flex items-center mt-1">
                <Calendar className="mr-1 h-4 w-4" />
                Kayıt Tarihi: {format(new Date(typedCustomer.created_at), "dd.MM.yyyy")}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="text-sm">
                ID: {typedCustomer.mid}
              </Badge>
              {isDeleted && (
                <Badge variant="destructive" className="text-sm">
                  Arşivlenmiş
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* İletişim Bilgileri */}
            <div>
              <h3 className="text-lg font-medium mb-3">İletişim Bilgileri</h3>
              <div className="space-y-2">
                {typedCustomer.email && (
                  <p className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${typedCustomer.email}`} className="hover:underline">
                      {typedCustomer.email}
                    </a>
                  </p>
                )}
                {typedCustomer.phone && (
                  <p className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${typedCustomer.phone}`} className="hover:underline">
                      {typedCustomer.phone}
                    </a>
                  </p>
                )}
                {!typedCustomer.email && !typedCustomer.phone && (
                  <p className="text-sm text-muted-foreground">İletişim bilgisi yok</p>
                )}
              </div>
            </div>

            {/* Şirket Bilgileri */}
            <div>
              <h3 className="text-lg font-medium mb-3">Şirket Bilgileri</h3>
              <div className="space-y-2">
                {typedCustomer.company_name && (
                  <p className="flex items-center text-sm">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    {typedCustomer.company_name}
                  </p>
                )}
                {typedCustomer.tax_number && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Vergi No:</span> {typedCustomer.tax_number}
                  </p>
                )}
                {!typedCustomer.company_name && !typedCustomer.tax_number && (
                  <p className="text-sm text-muted-foreground">Şirket bilgisi yok</p>
                )}
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div>
              <h3 className="text-lg font-medium mb-3">Adres Bilgileri</h3>
              <div className="space-y-2">
                {typedCustomer.address && (
                  <p className="flex items-start text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>
                      {typedCustomer.address}
                      {typedCustomer.city && <>, {typedCustomer.city}</>}
                      {typedCustomer.postal_code && <> {typedCustomer.postal_code}</>}
                      {typedCustomer.country && <>, {typedCustomer.country}</>}
                    </span>
                  </p>
                )}
                {!typedCustomer.address && <p className="text-sm text-muted-foreground">Adres bilgisi yok</p>}
              </div>
            </div>
          </div>

          {typedCustomer.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-2">Notlar</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{typedCustomer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isDeleted && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="sales">Satış Geçmişi</TabsTrigger>
            <TabsTrigger value="invoices">Fatura Geçmişi</TabsTrigger>
            <TabsTrigger value="insights">Satın Alma Analizi</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <CustomerOverview customer={typedCustomer} />
          </TabsContent>
          <TabsContent value="sales" className="space-y-4">
            <CustomerSalesHistory sales={sales as Sale[]} />
          </TabsContent>
          <TabsContent value="invoices" className="space-y-4">
            <CustomerInvoiceHistory invoices={invoices as Invoice[]} />
          </TabsContent>
          <TabsContent value="insights" className="space-y-4">
            <CustomerPurchaseInsights insights={insights} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
