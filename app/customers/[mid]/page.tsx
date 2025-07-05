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
import { formatDate, formatCurrency, formatSaleStatusTR, getSaleStatusBadgeVariant } from "@/lib/utils"
import DeleteCustomerDialog from "./_components/delete-customer-dialog"

// --- TYPE DEFINITIONS ---
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

// --- INLINE COMPONENTS ---

// Helper component for displaying info items
function InfoItem({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{children || value || "-"}</div>
    </div>
  )
}

// Insight card component
function InsightCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
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
                <TableCell className="font-mono text-xs">{sale.id || "-"}</TableCell>
                <TableCell>{formatDate(sale.sale_date)}</TableCell>
                <TableCell>
                  <Badge variant={getSaleStatusBadgeVariant(sale.status)} className="capitalize">
                    {formatSaleStatusTR(sale.status)}
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
                  <Badge variant={getSaleStatusBadgeVariant(invoice.status)} className="capitalize">
                    {formatSaleStatusTR(invoice.status)}
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

// --- MAIN PAGE COMPONENT ---
export default async function CustomerDetailPage({ params }: { params: { mid: string } }) {
  const supabase = createClient()
  const customerId = params.mid

  // 1. Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirect("/auth/login")
  }

  // 2. Fetch all data in parallel
  const [customerResult, salesResult, invoicesResult] = await Promise.all([
    supabase.from("customers").select("*").eq("mid", customerId).single(),
    supabase
      .from("sales")
      .select("id, sale_date, total_amount, status")
      .eq("customer_mid", customerId)
      .order("sale_date", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_number, issue_date, total_amount, status")
      .eq("customer_mid", customerId)
      .order("issue_date", { ascending: false }),
  ])

  // 3. Handle customer not found
  if (customerResult.error || !customerResult.data) {
    console.error("Müşteri bulunamadı:", customerResult.error?.message)
    notFound()
  }

  const customer: Customer = customerResult.data
  const sales: Sale[] = salesResult.data || []
  const invoices: Invoice[] = invoicesResult.data || []
  const isDeleted = !!customer.deleted_at

  // 4. Calculate insights
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
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <Link href="/customers" className="flex items-center">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Müşterilere Geri Dön
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {!isDeleted && (
            <Link href={`/customers/${customer.mid}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Düzenle
              </Button>
            </Link>
          )}
          <DeleteCustomerDialog
            customerId={customer.mid}
            customerName={customer.contact_name || customer.company_name || "Bilinmeyen"}
            isDeleted={isDeleted}
          />
        </div>
      </header>

      <main>
        <Card className="mb-8">
          <CardHeader className="bg-muted/50 p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                  <User className="h-7 w-7 lg:h-8 lg:w-8 text-primary" />
                  {customer.contact_name || customer.company_name || "İsimsiz Müşteri"}
                </CardTitle>
                <CardDescription className="text-md flex items-center mt-2 text-muted-foreground">
                  <Calendar className="mr-1.5 h-4 w-4" />
                  Kayıt Tarihi:{" "}
                  {format(new Date(customer.created_at), "dd MMMM yyyy, HH:mm", {
                    locale: require("date-fns/locale/tr"),
                  })}
                </CardDescription>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <Badge variant="secondary" className="text-sm">
                  ID: {customer.mid}
                </Badge>
                {isDeleted && (
                  <Badge variant="destructive" className="text-sm font-semibold">
                    ARŞİVLENMİŞ
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <InfoItem label="İletişim Bilgileri">
                <div className="space-y-2">
                  {customer.email && (
                    <a href={`mailto:${customer.email}`} className="flex items-center hover:text-primary">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {customer.email}
                    </a>
                  )}
                  {customer.phone && (
                    <a href={`tel:${customer.phone}`} className="flex items-center hover:text-primary">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" /> {customer.phone}
                    </a>
                  )}
                  {!customer.email && !customer.phone && <p className="text-muted-foreground">Girilmemiş</p>}
                </div>
              </InfoItem>
              <InfoItem label="Şirket Bilgileri">
                <div className="space-y-2">
                  {customer.company_name && (
                    <p className="flex items-center">
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" /> {customer.company_name}
                    </p>
                  )}
                  {customer.tax_number && <p>Vergi No: {customer.tax_number}</p>}
                  {!customer.company_name && !customer.tax_number && (
                    <p className="text-muted-foreground">Girilmemiş</p>
                  )}
                </div>
              </InfoItem>
              <InfoItem label="Adres">
                {customer.address ? (
                  <p className="flex items-start">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>
                      {customer.address}, {customer.city} {customer.postal_code}, {customer.country}
                    </span>
                  </p>
                ) : (
                  <p className="text-muted-foreground">Girilmemiş</p>
                )}
              </InfoItem>
            </div>
            {customer.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">Notlar</h3>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {!isDeleted && (
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="sales">Satış Geçmişi</TabsTrigger>
              <TabsTrigger value="invoices">Fatura Geçmişi</TabsTrigger>
              <TabsTrigger value="insights">Satın Alma Analizi</TabsTrigger>
            </TabsList>
            <TabsContent value="sales" className="mt-4">
              <CustomerSalesHistory sales={sales} />
            </TabsContent>
            <TabsContent value="invoices" className="mt-4">
              <CustomerInvoiceHistory invoices={invoices} />
            </TabsContent>
            <TabsContent value="insights" className="mt-4">
              <CustomerPurchaseInsights insights={insights} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
