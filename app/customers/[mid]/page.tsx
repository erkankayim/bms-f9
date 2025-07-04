import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Mail, MapPin, Phone, User, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CustomerOverview } from "./_components/customer-overview"
import { CustomerSalesHistory } from "./_components/customer-sales-history"
import { CustomerInvoiceHistory } from "./_components/customer-invoice-history"
import { CustomerPurchaseInsights } from "./_components/customer-purchase-insights"
import { DeleteCustomerDialog } from "./_components/delete-customer-dialog"

interface CustomerDetailPageProps {
  params: {
    mid: string
  }
}

async function getCustomer(mid: string) {
  const supabase = createClient()

  const { data: customer, error } = await supabase.from("customers").select("*").eq("mid", mid).single()

  if (error) {
    console.error("Error fetching customer:", error)
    return null
  }

  return customer
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const customer = await getCustomer(params.mid)

  if (!customer) {
    notFound()
  }

  const isDeleted = !!customer.deleted_at

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {customer.name}
              {isDeleted && <Badge variant="destructive">Silinmiş</Badge>}
            </h1>
            <p className="text-muted-foreground">Müşteri ID: {customer.mid}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/customers/${customer.mid}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Link>
          </Button>

          <DeleteCustomerDialog customerId={customer.mid} customerName={customer.name} isDeleted={isDeleted} />
        </div>
      </div>

      {/* Customer Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Müşteri Bilgileri
          </CardTitle>
          <CardDescription>Müşterinin temel bilgileri ve iletişim detayları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">E-posta</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Telefon</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </div>
            )}

            {customer.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Adres</p>
                  <p className="text-sm text-muted-foreground">{customer.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Kayıt Tarihi</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(customer.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="sales">Satış Geçmişi</TabsTrigger>
          <TabsTrigger value="invoices">Fatura Geçmişi</TabsTrigger>
          <TabsTrigger value="insights">Satın Alma Analizi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <CustomerOverview customerId={customer.mid} />
          </Suspense>
        </TabsContent>

        <TabsContent value="sales">
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <CustomerSalesHistory customerId={customer.mid} />
          </Suspense>
        </TabsContent>

        <TabsContent value="invoices">
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <CustomerInvoiceHistory customerId={customer.mid} />
          </Suspense>
        </TabsContent>

        <TabsContent value="insights">
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <CustomerPurchaseInsights customerId={customer.mid} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
