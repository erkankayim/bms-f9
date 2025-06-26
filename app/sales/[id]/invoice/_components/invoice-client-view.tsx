"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from "lucide-react"
import { InvoiceTemplate, type SaleDetailForInvoice, type CompanyInfo } from "./invoice-template"

interface InvoiceClientViewProps {
  sale: SaleDetailForInvoice
  companyInfo: CompanyInfo
}

export function InvoiceClientView({ sale, companyInfo }: InvoiceClientViewProps) {
  return (
    <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:py-0">
      <div className="container mx-auto mb-8 px-4 print:hidden">
        <div className="flex justify-between items-center">
          <Link href={`/sales/${sale.id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Satış Detayına Dön
            </Button>
          </Link>
          <Button onClick={() => typeof window !== "undefined" && window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Yazdır
          </Button>
        </div>
      </div>
      <InvoiceTemplate sale={sale} companyInfo={companyInfo} />
    </div>
  )
}
