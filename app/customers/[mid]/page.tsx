import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  FileText,
  CreditCard,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { DeleteCustomerDialog } from "./_components/delete-customer-dialog"

// Utility functions
function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return "₺0,00"
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
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Customer Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
              <InfoField label="Vergi Dairesi" value={customer.tax_office} icon={<Building className="h-4 w-4" />} />

              <InfoField label="Vergi Numarası" value={customer.tax_number} icon={<CreditCard className="h-4 w-4" />} />
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
              <InfoField label="Müşteri Grubu" value={customer.customer_group} icon={<Users className="h-4 w-4" />} />

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
          <Card className="mb-6">
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
