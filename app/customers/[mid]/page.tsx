import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, User, Building } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerOverview } from "./_components/customer-overview"
import { CustomerSalesHistory } from "./_components/customer-sales-history"
import { CustomerInvoiceHistory } from "./_components/customer-invoice-history"
import { CustomerPurchaseInsights } from "./_components/customer-purchase-insights"
import { DeleteCustomerDialog } from "./_components/delete-customer-dialog"

type Customer = {
  mid: string
  contact_name: string | null
  company_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  postal_code: string | null
  tax_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export default async function CustomerDetailPage({ params }: { params: { mid: string } }) {
  const supabase = createClient()
  const customerId = params.mid

  const { data: customer, error } = await supabase.from("customers").select("*").eq("mid", customerId).single()

  if (error || !customer) {
    console.error("Error fetching customer:", error?.message)
    notFound()
  }

  const typedCustomer = customer as Customer
  const isDeleted = !!typedCustomer.deleted_at

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
          <DeleteCustomerDialog
            customerId={typedCustomer.mid}
            customerName={typedCustomer.contact_name || typedCustomer.company_name || "Bilinmeyen"}
            isDeleted={isDeleted}
          />
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
            <CustomerOverview customerId={typedCustomer.mid} />
          </TabsContent>
          <TabsContent value="sales" className="space-y-4">
            <CustomerSalesHistory customerId={typedCustomer.mid} />
          </TabsContent>
          <TabsContent value="invoices" className="space-y-4">
            <CustomerInvoiceHistory customerId={typedCustomer.mid} />
          </TabsContent>
          <TabsContent value="insights" className="space-y-4">
            <CustomerPurchaseInsights customerId={typedCustomer.mid} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
