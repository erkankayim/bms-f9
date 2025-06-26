"use client" // Bu bileşen client-side etkileşim içerebilir (örn: yazdırma butonu)
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import Image from "next/image" // Şirket logosu için

// SaleDetail tipini SaleDetailPage'den alabiliriz veya burada yeniden tanımlayabiliriz.
// Şimdilik SaleDetailPage'deki gibi varsayalım.
export type PaymentInstallment = {
  id: number
  due_date: string
  amount: number
  status: string
  paid_at: string | null
}

export type SaleItem = {
  id: number
  product_stock_code: string
  quantity: number
  unit_price: number
  vat_rate: number
  item_total_gross: number
  item_total_net: number
  products: {
    name: string
    sale_price_currency: string | null
  }
}

export type SaleDetailForInvoice = {
  id: number
  sale_date: string
  customer_mid: string | null
  total_amount: number
  discount_amount: number
  tax_amount: number
  final_amount: number
  payment_method: string | null
  status: string
  notes: string | null
  is_installment: boolean | null
  installment_count: number | null
  customers?: {
    contact_name: string | null
    email: string | null
    phone: string | null
    address?: string | null // Müşteri adresi eklendi
    city?: string | null
    province?: string | null
    postal_code?: string | null
    tax_office?: string | null
    tax_number?: string | null
  } | null
  sale_items: SaleItem[]
  payment_installments?: PaymentInstallment[]
}

// Şirket bilgileri için tip
export interface CompanyInfo {
  name: string
  logoUrl?: string
  addressLine1: string
  addressLine2?: string
  phone?: string
  email?: string
  website?: string
  taxOffice?: string
  taxNumber?: string
}

interface InvoiceTemplateProps {
  sale: SaleDetailForInvoice
  companyInfo: CompanyInfo // Şirket bilgileri prop olarak eklendi
}

// Ödeme yöntemini Türkçe'ye çevir
const formatPaymentMethod = (method: string | null) => {
  if (!method) return "-"
  switch (method.toLowerCase()) {
    case "cash":
      return "Nakit"
    case "credit_card":
      return "Kredi Kartı"
    case "bank_transfer":
      return "Banka Havalesi"
    case "other":
      return "Diğer"
    default:
      return method
  }
}

// Para birimi formatlama
const formatCurrency = (amount: number, currencyCode: string | null | undefined, locale = "tr-TR") => {
  const code = currencyCode || "TRY"
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency: code, minimumFractionDigits: 2 }).format(amount)
  } catch (e) {
    return `${amount.toFixed(2)} ${code}`
  }
}

export function InvoiceTemplate({ sale, companyInfo }: InvoiceTemplateProps) {
  const invoiceDate = format(new Date(sale.sale_date), "dd.MM.yyyy")
  // Vade tarihi için örnek: Satış tarihinden 30 gün sonrası
  const dueDate = sale.is_installment
    ? "Taksit Planına Bakınız"
    : format(new Date(new Date(sale.sale_date).setDate(new Date(sale.sale_date).getDate() + 30)), "dd.MM.yyyy")

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 md:p-12 max-w-4xl mx-auto print:shadow-none print:p-0">
      {/* Fatura Başlığı ve Şirket Logosu */}
      <header className="flex flex-col sm:flex-row justify-between items-start mb-8 print:mb-6">
        <div>
          {companyInfo.logoUrl && (
            <Image
              src={companyInfo.logoUrl || "/placeholder.svg"}
              alt={`${companyInfo.name} Logo`}
              width={150}
              height={75}
              className="mb-4 print:w-32"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-800 print:text-2xl">{companyInfo.name}</h1>
          <p className="text-sm text-gray-500">{companyInfo.addressLine1}</p>
          {companyInfo.addressLine2 && <p className="text-sm text-gray-500">{companyInfo.addressLine2}</p>}
          {companyInfo.phone && <p className="text-sm text-gray-500">Tel: {companyInfo.phone}</p>}
          {companyInfo.email && <p className="text-sm text-gray-500">Email: {companyInfo.email}</p>}
          {companyInfo.website && (
            <p className="text-sm text-gray-500">
              Web:{" "}
              <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                {companyInfo.website}
              </a>
            </p>
          )}
          {companyInfo.taxOffice && <p className="text-sm text-gray-500">V.D.: {companyInfo.taxOffice}</p>}
          {companyInfo.taxNumber && <p className="text-sm text-gray-500">V.N.: {companyInfo.taxNumber}</p>}
        </div>
        <div className="text-right mt-4 sm:mt-0">
          <h2 className="text-2xl font-semibold text-gray-700 uppercase print:text-xl">FATURA</h2>
          <p className="text-gray-500">
            Fatura No: <span className="font-medium text-gray-700">INV-{sale.id.toString().padStart(6, "0")}</span>
          </p>
          <p className="text-gray-500">
            Tarih: <span className="font-medium text-gray-700">{invoiceDate}</span>
          </p>
          <p className="text-gray-500">
            Vade Tarihi: <span className="font-medium text-gray-700">{dueDate}</span>
          </p>
        </div>
      </header>

      <Separator className="my-8 print:my-6" />

      {/* Müşteri Bilgileri */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:mb-6">
        <div>
          <h3 className="text-md font-semibold text-gray-600 mb-1 uppercase">Fatura Adresi (Alıcı):</h3>
          {sale.customers ? (
            <>
              <p className="font-medium text-gray-800">{sale.customers.contact_name || "N/A"}</p>
              {sale.customers.address && <p className="text-sm text-gray-500">{sale.customers.address}</p>}
              <p className="text-sm text-gray-500">
                {sale.customers.city || ""} {sale.customers.province || ""} {sale.customers.postal_code || ""}
              </p>
              {sale.customers.phone && <p className="text-sm text-gray-500">Tel: {sale.customers.phone}</p>}
              {sale.customers.email && <p className="text-sm text-gray-500">Email: {sale.customers.email}</p>}
              {sale.customers.taxOffice && <p className="text-sm text-gray-500">V.D.: {sale.customers.taxOffice}</p>}
              {sale.customers.taxNumber && <p className="text-sm text-gray-500">V.N.: {sale.customers.taxNumber}</p>}
            </>
          ) : (
            <p className="text-sm text-gray-500">Misafir Müşteri</p>
          )}
        </div>
        {/* İsteğe bağlı: Kargo Adresi
        <div>
          <h3 className="text-md font-semibold text-gray-600 mb-1 uppercase">Kargo Adresi:</h3>
          <p className="text-sm text-gray-500">...</p>
        </div>
        */}
      </section>

      {/* Satış Kalemleri Tablosu */}
      <section className="mb-8 print:mb-6">
        <Table className="print:text-xs">
          <TableHeader>
            <TableRow className="bg-gray-50 print:bg-gray-100">
              <TableHead className="w-[50px] print:w-[30px]">#</TableHead>
              <TableHead>Ürün / Hizmet</TableHead>
              <TableHead className="text-right">Miktar</TableHead>
              <TableHead className="text-right">Birim Fiyat</TableHead>
              <TableHead className="text-right">KDV (%)</TableHead>
              <TableHead className="text-right">Toplam</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.sale_items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium print:py-1">{index + 1}</TableCell>
                <TableCell className="print:py-1">
                  {item.products.name}
                  <div className="text-xs text-gray-400 print:hidden">SKU: {item.product_stock_code}</div>
                </TableCell>
                <TableCell className="text-right print:py-1">{item.quantity}</TableCell>
                <TableCell className="text-right print:py-1">
                  {formatCurrency(item.unit_price, item.products.sale_price_currency)}
                </TableCell>
                <TableCell className="text-right print:py-1">{(item.vat_rate * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-right font-medium print:py-1">
                  {formatCurrency(item.item_total_net, item.products.sale_price_currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* Toplamlar Bölümü */}
      <section className="flex justify-end mb-8 print:mb-6">
        <div className="w-full max-w-xs sm:max-w-sm print:max-w-xs">
          <div className="space-y-1 text-sm print:text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Ara Toplam:</span>
              <span className="font-medium text-gray-700">{formatCurrency(sale.total_amount, "TRY")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Toplam KDV:</span>
              <span className="font-medium text-gray-700">{formatCurrency(sale.tax_amount, "TRY")}</span>
            </div>
            {sale.discount_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">İndirim:</span>
                <span className="font-medium text-gray-700">-{formatCurrency(sale.discount_amount, "TRY")}</span>
              </div>
            )}
            <Separator className="my-2 print:my-1" />
            <div className="flex justify-between text-lg font-bold print:text-base">
              <span className="text-gray-800">Genel Toplam:</span>
              <span className="text-gray-800">{formatCurrency(sale.final_amount, "TRY")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ödeme Bilgileri ve Notlar */}
      <section className="mb-8 print:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-semibold text-gray-600 mb-1 uppercase">Ödeme Bilgileri:</h4>
            <p className="text-sm text-gray-500">Ödeme Yöntemi: {formatPaymentMethod(sale.payment_method)}</p>
            {sale.is_installment && sale.installment_count && (
              <p className="text-sm text-gray-500">Taksit Sayısı: {sale.installment_count}</p>
            )}
          </div>
          {sale.notes && (
            <div>
              <h4 className="text-md font-semibold text-gray-600 mb-1 uppercase">Notlar:</h4>
              <p className="text-sm text-gray-500 whitespace-pre-wrap">{sale.notes}</p>
            </div>
          )}
        </div>
      </section>

      {/* Taksit Planı (Eğer Varsa) */}
      {sale.is_installment && sale.payment_installments && sale.payment_installments.length > 0 && (
        <section className="mb-8 print:mb-6">
          <h4 className="text-md font-semibold text-gray-600 mb-2 uppercase">Ödeme Planı:</h4>
          <Table className="print:text-xs">
            <TableHeader>
              <TableRow className="bg-gray-50 print:bg-gray-100">
                <TableHead className="print:py-1">Taksit #</TableHead>
                <TableHead className="print:py-1">Vade Tarihi</TableHead>
                <TableHead className="text-right print:py-1">Tutar</TableHead>
                <TableHead className="text-center print:py-1">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.payment_installments.map((inst, index) => (
                <TableRow key={inst.id}>
                  <TableCell className="print:py-1">{index + 1}</TableCell>
                  <TableCell className="print:py-1">{format(parseISO(inst.due_date), "dd.MM.yyyy")}</TableCell>
                  <TableCell className="text-right print:py-1">{formatCurrency(inst.amount, "TRY")}</TableCell>
                  <TableCell className="text-center print:py-1">
                    <Badge
                      variant={
                        inst.status === "paid" ? "success" : inst.status === "overdue" ? "destructive" : "warning"
                      }
                      className="text-xs"
                    >
                      {inst.status === "paid"
                        ? "Ödendi"
                        : inst.status === "pending"
                          ? "Bekliyor"
                          : inst.status === "overdue"
                            ? "Gecikti"
                            : inst.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      {/* Fatura Alt Bilgisi */}
      <footer className="border-t pt-6 mt-8 text-center text-xs text-gray-400 print:mt-6 print:pt-4">
        <p>Faturanız için teşekkür ederiz!</p>
        <p>
          {companyInfo.name} - {companyInfo.addressLine1}
        </p>
        <p className="print:hidden">Bu fatura bilgisayar tarafından üretilmiştir ve imza gerektirmez.</p>
      </footer>
    </div>
  )
}

export default InvoiceTemplate
