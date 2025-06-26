import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { InvoiceClientView } from "./_components/invoice-client-view"
import type { SaleDetailForInvoice, CompanyInfo } from "./_components/invoice-template"

export default async function SaleInvoicePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const saleId = Number.parseInt(params.id)

  if (isNaN(saleId)) {
    notFound()
  }

  // 1. Şirket profilini veritabanından çek
  const { data: companyProfile, error: companyError } = await supabase
    .from("company_profile")
    .select("*")
    .limit(1)
    .single()

  if (companyError) {
    console.error("Error fetching company profile:", companyError.message)
    // Şirket profili bulunamazsa bile sayfanın çökmemesi için varsayılan değerler kullanılabilir.
  }

  // 2. Gelen veriyi CompanyInfo tipine map'le
  const companyInfoData: CompanyInfo = {
    name: companyProfile?.name || "Şirket Adı Belirtilmemiş",
    logoUrl: companyProfile?.logo_url || undefined,
    addressLine1: companyProfile?.address_line1 || "",
    addressLine2: companyProfile?.address_line2 || undefined,
    phone: companyProfile?.phone || undefined,
    email: companyProfile?.email || undefined,
    website: companyProfile?.website || undefined,
    taxOffice: companyProfile?.tax_office || undefined,
    taxNumber: companyProfile?.tax_number || undefined,
  }

  // 3. Satış verisini çek
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

  // 4. Dinamik şirket bilgileri ve satış verisi ile bileşeni render et
  return <InvoiceClientView sale={typedSale} companyInfo={companyInfoData} />
}
