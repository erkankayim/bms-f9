import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { InvoiceClientView } from "./_components/invoice-client-view"
import type { SaleDetailForInvoice } from "./_components/invoice-template"

export default async function SaleInvoicePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const saleId = Number.parseInt(params.id)

  if (isNaN(saleId)) {
    notFound()
  }

  // Satış verisini çek
  const { data: sale, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      customers (
        contact_name,
        email,
        phone,
        address, 
        city, 
        province, 
        postal_code,
        tax_office,
        tax_number
      ),
      sale_items (
        id,
        product_stock_code,
        quantity,
        unit_price,
        vat_rate,
        item_total_gross,
        item_total_net,
        products (
          name,
          sale_price_currency
        )
      ),
      payment_installments (
        id,
        due_date,
        amount,
        status,
        paid_at
      )
    `,
    )
    .eq("id", saleId)
    .is("deleted_at", null)
    .single()

  if (error || !sale) {
    console.error("Error fetching sale for invoice:", error?.message)
    notFound()
  }

  const typedSale = sale as SaleDetailForInvoice

  return <InvoiceClientView sale={typedSale} />
}
