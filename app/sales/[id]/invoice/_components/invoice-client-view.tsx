"use client"
import { Button } from "@/components/ui/button"
import { Printer, Download } from "lucide-react"
import { InvoiceTemplate } from "./invoice-template"
import type { SaleDetailForInvoice } from "./invoice-template"

interface InvoiceClientViewProps {
  sale: SaleDetailForInvoice
}

export function InvoiceClientView({ sale }: InvoiceClientViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Bu fonksiyon gelecekte PDF indirme için kullanılabilir
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Yazdırma Butonları - Sadece ekranda görünür */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm p-4 print:hidden">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Fatura Görünümü</h1>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Yazdır
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              PDF İndir
            </Button>
          </div>
        </div>
      </div>

      {/* Fatura İçeriği */}
      <div className="py-8 print:py-0">
        <InvoiceTemplate sale={sale} />
      </div>
    </div>
  )
}
