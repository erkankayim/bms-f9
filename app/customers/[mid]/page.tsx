import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, User, Building } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CustomerOverview from "./_components/customer-overview"
import CustomerSalesHistory from "./_components/customer-sales-history"
import CustomerInvoiceHistory from "./_components/customer-invoice-history"
import CustomerPurchaseInsights from "./_components/customer-purchase-insights"
import { DeleteCustomerDialog } from "./_components/delete-customer-dialog"
import type { Customer, Sale, Invoice, PurchaseInsights } from "./_components/helpers"

async function getCustomerData(customerId: string) {
  const supabase = createClient()

  // Get customer data
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("mid", customerId)
    .single()

  if (customerError || !customer) {
    return null
  }

  // Get sales data
  const { data: sales } = await supabase
    .from("sales")
    .select("id, sale_date, total_amount, status")
    .eq("customer_id", customerId)
    .order("sale_date", { ascending: false })

  // Get invoices data
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, issue_date, total_amount, status")
    .eq("customer_id", customerId)
    .order("issue_date", { ascending: false })

  // Calculate purchase insights
  const insights: PurchaseInsights | null =
    sales && sales.length > 0
      ? {
          total_spending: sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0),
          total_orders: sales.length,
          first_purchase_date: sales[sales.length - 1]?.sale_date || null,
          last_purchase_date: sales[0]?.sale_date || null,
        }
      : null

  return {
    customer: customer as Customer,
    sales: (sales || []) as Sale[],
    invoices: (invoices || []) as Invoice[],
    insights,
  }
}

export default async function CustomerDetailPage({ params }: { params: { mid: string } }) {
  const customerId = params.mid
  const data = await getCustomerData(customerId)

  if (!data) {
    notFound()
  }

  const { customer, sales, invoices, insights } = data
  const isDeleted = !!customer.deleted_at

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
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-muted/50 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <User className="h-8 w-8" />
                {customer.contact_name || customer.company_name || "İsimsiz Müşteri"}
              </CardTitle>
              <CardDescription className="text-md flex items-center mt-1">
                <Calendar className="mr-1 h-4 w-4" />
                Kayıt Tarihi: {format(new Date(customer.created_at), "dd.MM.yyyy")}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="text-sm">
                ID: {customer.mid}
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
                {customer.email && (
                  <p className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${customer.email}`} className="hover:underline">
                      {customer.email}
                    </a>
                  </p>
                )}
                {customer.phone && (
                  <p className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="hover:underline">
                      {customer.phone}
                    </a>
                  </p>
                )}
                {!customer.email && !customer.phone && (
                  <p className="text-sm text-muted-foreground">İletişim bilgisi yok</p>
                )}
              </div>
            </div>

            {/* Şirket Bilgileri */}
            <div>
              <h3 className="text-lg font-medium mb-3">Şirket Bilgileri</h3>
              <div className="space-y-2">
                {customer.company_name && (
                  <p className="flex items-center text-sm">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    {customer.company_name}
                  </p>
                )}
                {customer.tax_number && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Vergi No:</span> {customer.tax_number}
                  </p>
                )}
                {!customer.company_name && !customer.tax_number && (
                  <p className="text-sm text-muted-foreground">Şirket bilgisi yok</p>
                )}
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div>
              <h3 className="text-lg font-medium mb-3">Adres Bilgileri</h3>
              <div className="space-y-2">
                {customer.address && (
                  <p className="flex items-start text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>
                      {customer.address}
                      {customer.city && <>, {customer.city}</>}
                      {customer.postal_code && <> {customer.postal_code}</>}
                      {customer.country && <>, {customer.country}</>}
                    </span>
                  </p>
                )}
                {!customer.address && <p className="text-sm text-muted-foreground">Adres bilgisi yok</p>}
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-2">Notlar</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
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
            <CustomerOverview customer={customer} />
          </TabsContent>
          <TabsContent value="sales" className="space-y-4">
            <CustomerSalesHistory sales={sales} />
          </TabsContent>
          <TabsContent value="invoices" className="space-y-4">
            <CustomerInvoiceHistory invoices={invoices} />
          </TabsContent>
          <TabsContent value="insights" className="space-y-4">
            <CustomerPurchaseInsights insights={insights} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
