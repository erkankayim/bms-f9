import { notFound } from "next/navigation"
import { getInvoiceById } from "../_actions/invoice-actions"
import InvoiceDetail from "./_components/invoice-detail"

interface InvoiceDetailPageProps {
  params: {
    id: string
  }
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const invoiceId = Number.parseInt(params.id)

  if (isNaN(invoiceId)) {
    notFound()
  }

  const invoice = await getInvoiceById(invoiceId)

  if (!invoice) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <InvoiceDetail invoice={invoice} />
    </div>
  )
}
