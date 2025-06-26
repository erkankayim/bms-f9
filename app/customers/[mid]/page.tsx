// Bu satırı dosyanın en başına ekleyin
export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, ServerCrash } from "lucide-react"

import { getCustomerPageData, deleteCustomer, restoreCustomer } from "./_actions/actions"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import CustomerOverview from "./_components/customer-overview"
import CustomerSalesHistory from "./_components/customer-sales-history"
import CustomerInvoiceHistory from "./_components/customer-invoice-history"
import CustomerPurchaseInsights from "./_components/customer-purchase-insights"
import { DeleteCustomerDialog } from "./_components/delete-customer-dialog"

export default async function CustomerDetailPage({ params }: { params: { mid: string } }) {
  const customerId = params.mid
  const { data, error } = await getCustomerPageData(customerId)

  if (error || !data) {
    if (error === "Müşteri bulunamadı veya veritabanı hatası oluştu.") {
      notFound()
    }
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Veri Yüklenemedi</AlertTitle>
          <AlertDescription>{error || "Bilinmeyen bir hata oluştu."}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { customer, sales, invoices, insights } = data
  const isDeleted = !!customer.deleted_at

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" /> Müşterilere Dön
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {!isDeleted && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/customers/${customerId}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Düzenle
              </Link>
            </Button>
          )}
          <DeleteCustomerDialog
            customerId={customerId}
            customerName={customer.contact_name || customerId}
            isDeleted={isDeleted}
            deleteAction={deleteCustomer}
            restoreAction={restoreCustomer}
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                {customer.contact_name || `Müşteri ID: ${customerId}`}
                {isDeleted && <Badge variant="destructive">ARŞİVLENMİŞ</Badge>}
              </CardTitle>
              <CardDescription>Müşterinin detayları, geçmişi ve öngörüleri.</CardDescription>
            </div>
            {customer.customer_group && (
              <Badge variant="secondary" className="text-sm">
                {customer.customer_group}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="sales">Satışlar</TabsTrigger>
          <TabsTrigger value="invoices">Faturalar</TabsTrigger>
          <TabsTrigger value="insights">Öngörüler</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <CustomerOverview customer={customer} />
        </TabsContent>
        <TabsContent value="sales">
          <CustomerSalesHistory sales={sales} />
        </TabsContent>
        <TabsContent value="invoices">
          <CustomerInvoiceHistory invoices={invoices} />
        </TabsContent>
        <TabsContent value="insights">
          <CustomerPurchaseInsights insights={insights} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
