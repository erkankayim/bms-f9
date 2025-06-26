import { Suspense } from "react"
import InvoiceForm from "./_components/invoice-form"
import { getCustomersForInvoice, getSuppliersForInvoice } from "../_actions/invoice-actions"

export default async function NewInvoicePage() {
  const [customers, suppliers] = await Promise.all([getCustomersForInvoice(), getSuppliersForInvoice()])

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <InvoiceForm customers={customers} suppliers={suppliers} />
      </Suspense>
    </div>
  )
}
