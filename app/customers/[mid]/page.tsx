import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, User } from "lucide-react"
import Link from "next/link"

import { getCustomerPageData, deleteCustomer, restoreCustomer } from "./_actions/actions"
import { CustomerOverview } from "./_components/customer-overview"
import { CustomerSalesHistory } from "./_components/customer-sales-history"
import { CustomerInvoiceHistory } from "./_components/customer-invoice-history"
import { CustomerPurchaseInsights } from "./_components/customer-purchase-insights"
import { DeleteCustomerDialog } from "./_components/delete-customer-dialog"

interface CustomerPageProps {
  params: {
    mid: string
  }
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const { data, error } = await getCustomerPageData(params.mid)

  if (error || !data) {
    console.error("Customer page error:", error)
    notFound()
  }

  const { customer, sales, invoices, insights } = data
  const isDeleted = !!customer.deleted_at

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            {isDeleted && <Badge variant="destructive">Arşivlenmiş</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/customers/${params.mid}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Link>
          </Button>
          <DeleteCustomerDialog
            customerId={customer.mid}
            customerName={customer.name}
            isDeleted={isDeleted}
            deleteAction={deleteCustomer}
            restoreAction={restoreCustomer}
          />
        </div>
      </div>

      <Separator />

      {/* Customer Overview */}
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <CustomerOverview customer={customer} />
      </Suspense>

      {/* Purchase Insights */}
      {insights && (
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <CustomerPurchaseInsights insights={insights} />
        </Suspense>
      )}

      {/* Sales History */}
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <CustomerSalesHistory sales={sales} customerId={customer.mid} />
      </Suspense>

      {/* Invoice History */}
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <CustomerInvoiceHistory invoices={invoices} customerId={customer.mid} />
      </Suspense>
    </div>
  )
}
