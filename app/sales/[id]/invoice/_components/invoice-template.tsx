"use client"
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

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
  sale_currency: string | null
  customers?: {
    contact_name: string | null
    email: string | null
    phone: string | null
    address?: string | null
    city?: string | null
    province?: string | null
    postal_code?: string | null
    tax_office?: string | null
    tax_number?: string | null
  } | null
  sale_items: SaleItem[]
  payment_installments?: PaymentInstallment[]
}

interface InvoiceTemplateProps {
  sale: SaleDetailForInvoice
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

export function InvoiceTemplate({ sale }: InvoiceTemplateProps) {
  const invoiceDate = format(new Date(sale.sale_date), "dd.MM.yyyy")
  const dueDate = sale.is_installment
    ? "Taksit Planına Bakınız"
    : format(new Date(new Date(sale.sale_date).setDate(new Date(sale.sale_date).getDate() + 30)), "dd.MM.yyyy")

  const saleCurrency = sale.sale_currency || "TRY"

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto print:shadow-none print:p-6 print:max-w-none print:rounded-none">
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:text-xs { font-size: 10px !important; }
          .print\\:text-sm { font-size: 12px !important; }
          .print\\:text-base { font-size: 14px !important; }
          .print\\:text-lg { font-size: 16px !important; }
          .print\\:text-xl { font-size: 18px !important; }
          .print\\:py-1 { padding-top: 2px !important; padding-bottom: 2px !important; }
          .print\\:mb-2 { margin-bottom: 8px !important; }
          .print\\:mb-4 { margin-bottom: 16px !important; }
          .print\\:mb-6 { margin-bottom: 24px !important; }
          .print\\:mt-4 { margin-top: 16px !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:page-break-inside-avoid { page-break-inside: avoid !important; }
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      {/* Fatura Başlığı ve Şirket Logosu */}
      <header className="flex flex-col sm:flex-row justify-between items-start mb-8 print:mb-6">
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <Image
              src="/mny-makine-logo.svg"
              alt="MNY Makine Logo"
              width={120}
              height={60}
              className="mr-4 print:w-20 print:h-10"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 print:text-xl">MNY MAKİNE</h1>
              <p className="text-sm text-gray-600 print:text-xs">Makine ve Ekipman Çözümleri</p>
            </div>
          </div>
          <div className="text-sm text-gray-600 print:text-xs space-y-1">
            <p>
              <strong>Adres:</strong> Huzur, Çamlıca Cd. No:29-31 B, 34773 Ümraniye/İstanbul
            </p>
            <p>
              <strong>Telefon:</strong> 0542 296 10 66
            </p>
            <p>
              <strong>E-posta:</strong> info@mnymakine.com
            </p>
            <p>
              <strong>Web:</strong> www.mnymakine.com
            </p>
          </div>
        </div>
        <div className="text-right mt-4 sm:mt-0 print:mt-0">
          <h2 className="text-2xl font-semibold text-gray-700 uppercase print:text-lg">FATURA</h2>
          <div className="text-sm text-gray-600 print:text-xs space-y-1 mt-2">
            <p>
              <strong>Fatura No:</strong> INV-{sale.id.toString().padStart(6, "0")}
            </p>
            <p>
              <strong>Tarih:</strong> {invoiceDate}
            </p>
            <p>
              <strong>Vade Tarihi:</strong> {dueDate}
            </p>
            <p>
              <strong>Para Birimi:</strong> {saleCurrency}
            </p>
          </div>
        </div>
      </header>

      <Separator className="my-6 print:my-4" />

      {/* Müşteri Bilgileri */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:mb-6 print:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2 print:text-base print:mb-1">FATURA ADRESİ</h3>
          <div className="bg-gray-50 p-4 rounded-lg print:bg-transparent print:p-2 print:border print:border-gray-300">
            {sale.customers ? (
              <div className="text-sm print:text-xs space-y-1">
                <p className="font-semibold text-gray-800">{sale.customers.contact_name || "N/A"}</p>
                {sale.customers.address && <p>{sale.customers.address}</p>}
                <p>
                  {sale.customers.city || ""} {sale.customers.province || ""} {sale.customers.postal_code || ""}
                </p>
                {sale.customers.phone && (
                  <p>
                    <strong>Tel:</strong> {sale.customers.phone}
                  </p>
                )}
                {sale.customers.email && (
                  <p>
                    <strong>E-posta:</strong> {sale.customers.email}
                  </p>
                )}
                {sale.customers.tax_office && (
                  <p>
                    <strong>Vergi Dairesi:</strong> {sale.customers.tax_office}
                  </p>
                )}
                {sale.customers.tax_number && (
                  <p>
                    <strong>Vergi No:</strong> {sale.customers.tax_number}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 print:text-xs">Misafir Müşteri</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2 print:text-base print:mb-1">ÖDEME BİLGİLERİ</h3>
          <div className="bg-gray-50 p-4 rounded-lg print:bg-transparent print:p-2 print:border print:border-gray-300">
            <div className="text-sm print:text-xs space-y-1">
              <p>
                <strong>Ödeme Yöntemi:</strong> {formatPaymentMethod(sale.payment_method)}
              </p>
              {sale.is_installment && sale.installment_count && (
                <p>
                  <strong>Taksit Sayısı:</strong> {sale.installment_count}
                </p>
              )}
              <p>
                <strong>Durum:</strong>
                <Badge variant={sale.status === "completed" ? "default" : "secondary"} className="ml-2 text-xs">
                  {sale.status === "completed"
                    ? "Tamamlandı"
                    : sale.status === "pending"
                      ? "Beklemede"
                      : sale.status === "cancelled"
                        ? "İptal Edildi"
                        : sale.status === "refunded"
                          ? "İade Edildi"
                          : sale.status}
                </Badge>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Satış Kalemleri Tablosu */}
      <section className="mb-8 print:mb-6 print:page-break-inside-avoid">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 print:text-base print:mb-2">ÜRÜN/HİZMET DETAYLARI</h3>
        <Table className="print:text-xs border">
          <TableHeader>
            <TableRow className="bg-gray-100 print:bg-gray-200">
              <TableHead className="w-[50px] print:w-[30px] border-r print:py-2">#</TableHead>
              <TableHead className="border-r print:py-2">Ürün/Hizmet Adı</TableHead>
              <TableHead className="text-center border-r print:py-2">Miktar</TableHead>
              <TableHead className="text-right border-r print:py-2">Birim Fiyat</TableHead>
              <TableHead className="text-center border-r print:py-2">KDV (%)</TableHead>
              <TableHead className="text-right print:py-2">Toplam</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.sale_items.map((item, index) => (
              <TableRow key={item.id} className="border-b">
                <TableCell className="font-medium print:py-2 border-r text-center">{index + 1}</TableCell>
                <TableCell className="print:py-2 border-r">
                  <div>
                    <p className="font-medium">{item.products.name}</p>
                    <p className="text-xs text-gray-500 print:text-[10px]">SKU: {item.product_stock_code}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center print:py-2 border-r">{item.quantity}</TableCell>
                <TableCell className="text-right print:py-2 border-r">
                  {formatCurrency(item.unit_price, saleCurrency)}
                </TableCell>
                <TableCell className="text-center print:py-2 border-r">{(item.vat_rate * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-right font-medium print:py-2">
                  {formatCurrency(item.item_total_net, saleCurrency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* Toplamlar Bölümü */}
      <section className="flex justify-end mb-8 print:mb-6">
        <div className="w-full max-w-sm print:max-w-xs">
          <div className="bg-gray-50 p-4 rounded-lg print:bg-transparent print:border print:border-gray-300 print:p-3">
            <div className="space-y-2 text-sm print:text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Ara Toplam:</span>
                <span className="font-medium">{formatCurrency(sale.total_amount, saleCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam KDV:</span>
                <span className="font-medium">{formatCurrency(sale.tax_amount, saleCurrency)}</span>
              </div>
              {sale.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">İndirim:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(sale.discount_amount, saleCurrency)}
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold print:text-base border-t pt-2">
                <span className="text-gray-800">GENEL TOPLAM:</span>
                <span className="text-gray-800">{formatCurrency(sale.final_amount, saleCurrency)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Taksit Planı (Eğer Varsa) */}
      {sale.is_installment && sale.payment_installments && sale.payment_installments.length > 0 && (
        <section className="mb-8 print:mb-6 print:page-break-inside-avoid">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 print:text-base print:mb-2">ÖDEME PLANI</h3>
          <Table className="print:text-xs border">
            <TableHeader>
              <TableRow className="bg-gray-100 print:bg-gray-200">
                <TableHead className="print:py-2 border-r">Taksit #</TableHead>
                <TableHead className="print:py-2 border-r">Vade Tarihi</TableHead>
                <TableHead className="text-right print:py-2 border-r">Tutar</TableHead>
                <TableHead className="text-center print:py-2">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.payment_installments.map((inst, index) => (
                <TableRow key={inst.id} className="border-b">
                  <TableCell className="print:py-2 border-r font-medium">{index + 1}</TableCell>
                  <TableCell className="print:py-2 border-r">{format(parseISO(inst.due_date), "dd.MM.yyyy")}</TableCell>
                  <TableCell className="text-right print:py-2 border-r">
                    {formatCurrency(inst.amount, saleCurrency)}
                  </TableCell>
                  <TableCell className="text-center print:py-2">
                    <Badge
                      variant={
                        inst.status === "paid" ? "default" : inst.status === "overdue" ? "destructive" : "secondary"
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

      {/* Notlar */}
      {sale.notes && (
        <section className="mb-8 print:mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2 print:text-base print:mb-1">NOTLAR</h3>
          <div className="bg-gray-50 p-4 rounded-lg print:bg-transparent print:border print:border-gray-300 print:p-2">
            <p className="text-sm text-gray-600 print:text-xs whitespace-pre-wrap">{sale.notes}</p>
          </div>
        </section>
      )}

      {/* Fatura Alt Bilgisi */}
      <footer className="border-t pt-6 mt-8 text-center print:mt-6 print:pt-4 print:border-t-2">
        <div className="text-xs text-gray-500 print:text-[10px] space-y-1">
          <p className="font-semibold">MNY MAKİNE - Makine ve Ekipman Çözümleri</p>
          <p>Huzur, Çamlıca Cd. No:29-31 B, 34773 Ümraniye/İstanbul</p>
          <p>Tel: 0542 296 10 66 | E-posta: info@mnymakine.com</p>
          <p className="mt-4 print:mt-2">Bu fatura elektronik ortamda oluşturulmuştur.</p>
          <p>Faturanızı tercih ettiğiniz için teşekkür ederiz!</p>
        </div>
      </footer>
    </div>
  )
}

export default InvoiceTemplate
