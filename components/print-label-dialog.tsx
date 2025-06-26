"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Printer } from "lucide-react"
import { BarcodeDisplay } from "@/components/barcode-display"

interface PrintLabelDialogProps {
  product: {
    name: string
    stock_code: string
    sale_price?: number | null
  }
}

export function PrintLabelDialog({ product }: PrintLabelDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Etiket Yazdır">
          <Printer className="h-4 w-4" />
          <span className="sr-only">Etiket Yazdır</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ürün Etiketi</DialogTitle>
        </DialogHeader>
        <div className="print-container">
          <div className="product-label">
            <div className="product-name">{product.name}</div>
            <div className="barcode-container">
              <BarcodeDisplay value={product.stock_code} className="w-full" />
            </div>
            <div className="product-code">Stok Kodu: {product.stock_code}</div>
            {product.sale_price && (
              <div className="product-price">
                {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(product.sale_price)}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handlePrint}>Yazdır</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
