"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"

interface BarcodeDisplayProps {
  value: string | null | undefined
  className?: string
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ value, className }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128", // Yaygın bir barkod formatı
          lineColor: "#000",
          width: 2,
          height: 50,
          displayValue: true, // Barkodun altında değeri göster
          fontSize: 14,
          margin: 10,
        })
      } catch (e) {
        console.error("Barkod oluşturulurken hata:", e)
        // Hata durumunda belki bir fallback gösterilebilir
        if (svgRef.current) {
          svgRef.current.innerHTML = "" // Temizle
        }
      }
    } else if (svgRef.current) {
      svgRef.current.innerHTML = "" // Değer yoksa temizle
    }
  }, [value])

  if (!value) {
    return <p className="text-sm text-muted-foreground">-</p> // Değer yoksa tire göster
  }

  return <svg ref={svgRef} className={className} aria-label={`Barkod değeri: ${value}`} role="img" />
}

// Default export olarak da ekleyelim, geriye dönük uyumluluk için
export default BarcodeDisplay
