import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  FileText,
  CreditCard,
  Users,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Eye,
  TrendingUp,
} from "lucide-react"
import { DeleteCustomerDialog } from "./_components/delete-customer-dialog"

// Type definitions
interface Sale {
  id: number
  sale_date: string
  total_amount: number | null
  discount_amount: number | null
  tax_amount: number | null
  final_amount: number | null
  payment_method: string | null
  status: string | null
  sale_currency: string | null
  is_installment: boolean | null
  installment_count: number | null
  notes: string | null
  created_at: string
}

// Utility functions
function formatCurrency(amount: number | null, currency = "TRY"): string {
  if (amount === null || amount === undefined) return "₺0,00"
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
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
    case "tamamlandı":
      return "default"
    case "pending":
    case "beklemede":
      return "secondary"
    case "cancelled":
    case "iptal":
    case "iptal edildi":
      return "destructive"
    case "refunded":
    case "iade edildi":
      return "outline"
    default:
      return "secondary"
  }
}

function formatStatus(status: string | null): string {
  if (!status) return "Bilinmiyor"

  const statusMap: Record<string, string> = {
    completed: "Tamamlandı",
    pending: "Beklemede",
    cancelled: "İptal Edildi",
    refunded: "İade Edildi",
  }

  return statusMap[status.toLowerCase()] || status
}

function formatPaymentMethod(method: string | null): string {
  if (!method) return "-"

  const methodMap: Record<string, string> = {
    cash: "Nakit",
    credit_card: "Kredi Kartı",
    bank_transfer: "Banka Havalesi",
    other: "Diğer",
  }

  return methodMap[method.toLowerCase()] || method
}

// Info display component
function InfoField({
  label,
  value,
  icon,
  isLink = false,
  linkType = "email",
}: {
  label: string
  value: string | null
  icon?: React.ReactNode
  isLink?: boolean
  linkType?: "email" | "phone"
}) {
  const displayValue = value || "Girilmemiş"
  const isEmpty = !value

  let linkHref = ""
  if (isLink && value) {
    linkHref = linkType === "email" ? `mailto:${value}` : `tel:${value}`
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
      </div>
      <div className="text-sm">
        {isLink && !isEmpty ? (
          <a href={linkHref} className="text-blue-600 hover:text-blue-800 hover:underline">
            {displayValue}
          </a>
        ) : (
          <span className={isEmpty ? "text-muted-foreground italic" : ""}>{displayValue}</span>
        )}
      </div>
    </div>
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

  // Calculate totals
  const totalSales = sales.length
  const totalAmount = sales.reduce((sum, sale) => sum + (sale.final_amount || 0), 0)
  const averageOrderValue = totalAmount / totalSales

  return (
    <div className="space-y-6">
      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Sipariş</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Satış Detayları</CardTitle>
          <CardDescription>Bu müşteriye yapılan tüm satışların listesi</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Satış ID</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Ödeme Yöntemi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="text-center">Taksit</TableHead>
                <TableHead className="text-center">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-xs">#{sale.id}</TableCell>
                  <TableCell>{formatDate(sale.sale_date)}</TableCell>
                  <TableCell>{formatPaymentMethod(sale.payment_method)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(sale.status)}>{formatStatus(sale.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(sale.final_amount, sale.sale_currency || "TRY")}
                  </TableCell>
                  <TableCell className="text-center">
                    {sale.is_installment && sale.installment_count ? (
                      <Badge variant="outline" className="text-xs">
                        {sale.installment_count} Taksit
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">Peşin</span>
                    )}
                  </TableCell>
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
    </div>
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

    // Fetch sales data for this customer
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select(`
        id,
        sale_date,
        total_amount,
        discount_amount,
        tax_amount,
        final_amount,
        payment_method,
        status,
        sale_currency,
        is_installment,
        installment_count,
        notes,
        created_at
      `)
      .eq("customer_mid", customerId)
      .is("deleted_at", null)
      .order("sale_date", { ascending: false })

    const sales: Sale[] = salesData || []
    const isDeleted = !!customer.deleted_at

    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
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
              <Link href={`/customers/${customer.mid}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Button>
              </Link>
            )}
            <DeleteCustomerDialog
              customerId={customer.mid}
              customerName={customer.contact_name || customer.service_name || "Bilinmeyen"}
              isDeleted={isDeleted}
            />
          </div>
        </div>

        {/* Customer Header Card */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {customer.contact_name || customer.service_name || "İsimsiz Müşteri"}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1 text-gray-600">
                    <Calendar className="mr-1 h-4 w-4" />
                    Kayıt Tarihi: {formatDate(customer.created_at)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <Badge variant="outline" className="text-sm font-medium">
                  ID: {customer.mid}
                </Badge>
                {isDeleted ? (
                  <Badge variant="destructive" className="text-sm">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Arşivlenmiş
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-sm bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Aktif
                  </Badge>
                )}
                {sales.length > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {sales.length} Satış
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs for Customer Info and Sales */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Müşteri Bilgileri</TabsTrigger>
            <TabsTrigger value="sales">Satış Geçmişi ({sales.length})</TabsTrigger>
          </TabsList>

          {/* Customer Information Tab */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Temel Bilgiler
                  </CardTitle>
                  <CardDescription>Müşterinin temel iletişim bilgileri</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <InfoField label="Müşteri ID" value={customer.mid} icon={<FileText className="h-4 w-4" />} />

                  <InfoField label="İletişim Adı" value={customer.contact_name} icon={<User className="h-4 w-4" />} />

                  <InfoField
                    label="Şirket/Servis Adı"
                    value={customer.service_name}
                    icon={<Building className="h-4 w-4" />}
                  />

                  <InfoField
                    label="E-posta"
                    value={customer.email}
                    icon={<Mail className="h-4 w-4" />}
                    isLink={true}
                    linkType="email"
                  />

                  <InfoField
                    label="Telefon"
                    value={customer.phone}
                    icon={<Phone className="h-4 w-4" />}
                    isLink={true}
                    linkType="phone"
                  />
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Adres Bilgileri
                  </CardTitle>
                  <CardDescription>Müşterinin adres ve konum bilgileri</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <InfoField label="Adres" value={customer.address} icon={<MapPin className="h-4 w-4" />} />

                  <InfoField label="Şehir" value={customer.city} />

                  <InfoField label="İl" value={customer.province} />

                  <InfoField label="Posta Kodu" value={customer.postal_code} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tax Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Vergi Bilgileri
                  </CardTitle>
                  <CardDescription>Faturalama için vergi bilgileri</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <InfoField
                    label="Vergi Dairesi"
                    value={customer.tax_office}
                    icon={<Building className="h-4 w-4" />}
                  />

                  <InfoField
                    label="Vergi Numarası"
                    value={customer.tax_number}
                    icon={<CreditCard className="h-4 w-4" />}
                  />
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    Diğer Bilgiler
                  </CardTitle>
                  <CardDescription>Ek müşteri bilgileri</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <InfoField
                    label="Müşteri Grubu"
                    value={customer.customer_group}
                    icon={<Users className="h-4 w-4" />}
                  />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium text-muted-foreground">Bakiye</label>
                    </div>
                    <div className="text-sm">
                      <span
                        className={`font-medium ${
                          customer.balance && customer.balance < 0
                            ? "text-red-600"
                            : customer.balance && customer.balance > 0
                              ? "text-green-600"
                              : "text-gray-600"
                        }`}
                      >
                        {formatCurrency(customer.balance)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes Section */}
            {customer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Notlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{customer.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  Sistem Bilgileri
                </CardTitle>
                <CardDescription>Kayıt ve güncelleme tarihleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    label="Oluşturulma Tarihi"
                    value={formatDateTime(customer.created_at)}
                    icon={<Calendar className="h-4 w-4" />}
                  />

                  <InfoField
                    label="Son Güncelleme"
                    value={formatDateTime(customer.updated_at)}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales History Tab */}
          <TabsContent value="sales" className="space-y-6">
            <CustomerSalesHistory sales={sales} />
          </TabsContent>
        </Tabs>

        {/* Deleted Customer Warning */}
        {isDeleted && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Arşivlenmiş Müşteri</AlertTitle>
            <AlertDescription>Bu müşteri arşivlenmiştir. Düzenleme işlemleri yapılamaz.</AlertDescription>
          </Alert>
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
