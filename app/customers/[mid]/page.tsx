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
import DeleteCustomerDialog from "./_components/delete-customer-dialog"

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

type Sale = {
  id: string
  sale_date: string
  total_amount: number | null
  status: string | null
}

type Invoice = {
  id: string
  invoice_number: string | null
  issue_date: string
  total_amount: number | null
  status: string | null
}

type PurchaseInsights = {
  total_spending: number
  total_orders: number
  first_purchase_date: string | null
  last_purchase_date: string | null
}

async function getCustomerData(customerId: string) {
  const supabase = createClient()
  const { data: customer, error } = await supabase.from("customers").select("*").eq("mid", customerId).single()

  if (error || !customer) {
    return null
  }

  return customer as Customer
}

async function getSalesData(customerId: string): Promise<Sale[]> {
  const supabase = createClient()
  const { data: sales, error } = await supabase
    .from("sales")
    .select("id, sale_date, total_amount, status")
    .eq("customer_id", customerId)
    .order("sale_date", { ascending: false })

  if (error) {
    console.error("Error fetching sales:", error.message)
    return []
  }

  return sales as Sale[]
}

async function getInvoicesData(customerId: string): Promise<Invoice[]> {
  const supabase = createClient()
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, issue_date, total_amount, status")
    .eq("customer_id", customerId)
    .order("issue_date", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error.message)
    return []
  }

  return invoices as Invoice[]
}

function calculateInsights(sales: Sale[]): PurchaseInsights | null {
  if (!sales || sales.length === 0) {
    return null
  }

  const totalSpending = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
  const totalOrders = sales.length
  const sortedDates = sales.map((s) => s.sale_date).sort()
  const firstPurchaseDate = sortedDates[0] || null
  const lastPurchaseDate = sortedDates[sortedDates.length - 1] || null

  return {
    total_spending: totalSpending,
    total_orders: totalOrders,
    first_purchase_date: firstPurchaseDate,
    last_purchase_date: lastPurchaseDate,
  }
}

export default async function CustomerDetailPage({ params }: { params: { mid: string } }) {
  const customerId = params.mid

  // Fetch all data
  const customer = await getCustomerData(customerId)

  if (!customer) {
    notFound()
  }

  const [sales, invoices] = await Promise.all([getSalesData(customerId), getInvoicesData(customerId)])

  const insights = calculateInsights(sales)
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
