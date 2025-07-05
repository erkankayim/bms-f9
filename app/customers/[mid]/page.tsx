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
  AlertCircle,
} from "lucide-react"
import DeleteCustomerDialog from "./_components/delete-customer-dialog"

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

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount)
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "Geçersiz tarih"
  }
}

function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Geçersiz tarih"
  }
}

function getStatusBadgeVariant(status: string | null): "default" | "secondary" | "destructive" | "outline" {
  if (!status) return "secondary"

  switch (status.toLowerCase()) {
    case "completed":
    case "paid":
    case "tamamlandı":
    case "ödendi":
      return "default"
    case "pending":
    case "beklemede":
      return "secondary"
    case "cancelled":
    case "iptal":
      return "destructive"
    default:
      return "outline"
  }
}

function formatStatus(status: string | null): string {
  if (!status) return "Bilinmiyor"

  const statusMap: Record<string, string> = {
    completed: "Tamamlandı",
    pending: "Beklemede",
    cancelled: "İptal Edildi",
    paid: "Ödendi",
    unpaid: "Ödenmedi",
    draft: "Taslak",
  }

  return statusMap[status.toLowerCase()] || status
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
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="text-sm">{children || value || <span className="text-muted-foreground">Girilmemiş</span>}</div>
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
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

export default async function CustomerDetailPage({
  params,
}: {
  params: { mid: string }
}) {
  try {
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
      console.error("Customer fetch error:", customerError?.message)
      notFound()
    }

    const typedCustomer = customer as Customer
    const isDeleted = !!typedCustomer.deleted_at

    // Fetch sales data
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select("id, sale_date, total_amount, status")
      .eq("customer_mid", customerId)
      .order("sale_date", { ascending: false })

    const sales: Sale[] = salesData || []

    // Fetch invoices data
    const { data: invoicesData, error: invoicesError } = await supabase
      .from("invoices")
      .select("id, invoice_number, issue_date, total_amount, status")
      .eq("customer_mid", customerId)
      .order("issue_date", { ascending: false })

    const invoices: Invoice[] = invoicesData || []

    // Calculate insights
    const totalSpending = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
    const totalOrders = sales.length
    const firstPurchaseDate = sales.length > 0 ? sales[sales.length - 1]?.sale_date : null
    const lastPurchaseDate = sales.length > 0 ? sales[0]?.sale_date : null

    return (
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Müşterilere Geri Dön
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {!isDeleted && (
              <Link href={`/customers/${typedCustomer.mid}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Button>
              </Link>
            )}
            <DeleteCustomerDialog
              customerId={typedCustomer.mid}
              customerName={typedCustomer.contact_name || typedCustomer.company_name || "Bilinmeyen"}
              isDeleted={isDeleted}
            />
          </div>
        </div>

        {/* Customer Info Card */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <User className="h-6 w-6" />
                  {typedCustomer.contact_name || typedCustomer.company_name || "İsimsiz Müşteri"}
                </CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <Calendar className="mr-1 h-4 w-4" />
                  Kayıt Tarihi: {formatDate(typedCustomer.created_at)}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant="outline">ID: {typedCustomer.mid}</Badge>
                {isDeleted && <Badge variant="destructive">Arşivlenmiş</Badge>}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <InfoItem label="İletişim Bilgileri">
                <div className="space-y-2">
                  {typedCustomer.email && (
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${typedCustomer.email}`} className="hover:underline text-blue-600">
                        {typedCustomer.email}
                      </a>
                    </div>
                  )}
                  {typedCustomer.phone && (
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${typedCustomer.phone}`} className="hover:underline text-blue-600">
                        {typedCustomer.phone}
                      </a>
                    </div>
                  )}
                  {!typedCustomer.email && !typedCustomer.phone && (
                    <span className="text-muted-foreground">İletişim bilgisi yok</span>
                  )}
                </div>
              </InfoItem>

              {/* Company Information */}
              <InfoItem label="Şirket Bilgileri">
                <div className="space-y-2">
                  {typedCustomer.company_name && (
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      {typedCustomer.company_name}
                    </div>
                  )}
                  {typedCustomer.tax_number && <div>Vergi No: {typedCustomer.tax_number}</div>}
                  {typedCustomer.customer_group && <Badge variant="secondary">{typedCustomer.customer_group}</Badge>}
                  {!typedCustomer.company_name && !typedCustomer.tax_number && (
                    <span className="text-muted-foreground">Şirket bilgisi yok</span>
                  )}
                </div>
              </InfoItem>

              {/* Address Information */}
              <InfoItem label="Adres Bilgileri">
                {typedCustomer.address ? (
                  <div className="flex items-start">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{typedCustomer.address}</div>
                      {typedCustomer.city && (
                        <div>
                          {typedCustomer.city} {typedCustomer.postal_code}
                        </div>
                      )}
                      {typedCustomer.country && <div>{typedCustomer.country}</div>}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Adres bilgisi yok</span>
                )}
              </InfoItem>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
              <InfoItem label="Hizmet/Abonelik" value={typedCustomer.service_name} />
              <InfoItem label="Bakiye">
                <span className={typedCustomer.balance && typedCustomer.balance < 0 ? "text-red-600" : ""}>
                  {formatCurrency(typedCustomer.balance || 0)}
                </span>
              </InfoItem>
            </div>

            {/* Notes */}
            {typedCustomer.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">Notlar</h3>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm">{typedCustomer.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t text-sm text-muted-foreground">
              <InfoItem label="Oluşturulma Tarihi" value={formatDateTime(typedCustomer.created_at)} />
              <InfoItem label="Son Güncelleme" value={formatDateTime(typedCustomer.updated_at)} />
            </div>
          </CardContent>
        </Card>

        {/* Tabs for additional information */}
        {!isDeleted && (
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales">Satış Geçmişi ({sales.length})</TabsTrigger>
              <TabsTrigger value="invoices">Fatura Geçmişi ({invoices.length})</TabsTrigger>
              <TabsTrigger value="insights">Satın Alma Analizi</TabsTrigger>
            </TabsList>

            {/* Sales History Tab */}
            <TabsContent value="sales" className="space-y-4">
              {sales.length === 0 ? (
                <Alert>
                  <ShoppingCart className="h-4 w-4" />
                  <AlertTitle>Satış Geçmişi Yok</AlertTitle>
                  <AlertDescription>Bu müşteri için henüz bir satış kaydedilmemiş.</AlertDescription>
                </Alert>
              ) : (
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
                          <TableHead className="text-center">İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                            <TableCell>{formatDate(sale.sale_date)}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(sale.status)}>{formatStatus(sale.status)}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(sale.total_amount || 0)}</TableCell>
                            <TableCell className="text-center">
                              <Button asChild variant="outline" size="sm">
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
              )}
            </TabsContent>

            {/* Invoices History Tab */}
            <TabsContent value="invoices" className="space-y-4">
              {invoices.length === 0 ? (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Fatura Geçmişi Yok</AlertTitle>
                  <AlertDescription>Bu müşteri için henüz bir fatura oluşturulmamış.</AlertDescription>
                </Alert>
              ) : (
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
                          <TableHead className="text-center">İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.invoice_number || "-"}</TableCell>
                            <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                                {formatStatus(invoice.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(invoice.total_amount || 0)}</TableCell>
                            <TableCell className="text-center">
                              <Button asChild variant="outline" size="sm">
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
              )}
            </TabsContent>

            {/* Purchase Insights Tab */}
            <TabsContent value="insights" className="space-y-4">
              {sales.length === 0 ? (
                <Alert>
                  <BarChart2 className="h-4 w-4" />
                  <AlertTitle>Öngörü Verisi Yok</AlertTitle>
                  <AlertDescription>
                    Bu müşteri için satın alma öngörüleri oluşturulacak yeterli veri bulunmuyor.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <InsightCard
                    title="Toplam Harcama"
                    value={formatCurrency(totalSpending)}
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <InsightCard title="Toplam Sipariş" value={totalOrders} icon={<ShoppingCart className="h-4 w-4" />} />
                  <InsightCard
                    title="İlk Alışveriş"
                    value={firstPurchaseDate ? formatDate(firstPurchaseDate) : "-"}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  <InsightCard
                    title="Son Alışveriş"
                    value={lastPurchaseDate ? formatDate(lastPurchaseDate) : "-"}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    )
  } catch (error) {
    console.error("Customer detail page error:", error)

    return (
      <div className="container mx-auto py-10 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata Oluştu</AlertTitle>
          <AlertDescription>
            Müşteri bilgileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/customers">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Müşterilere Geri Dön
            </Button>
          </Link>
        </div>
      </div>
    )
  }
}
