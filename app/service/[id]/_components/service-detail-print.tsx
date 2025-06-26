"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Printer } from "lucide-react"

interface ServiceDetailPrintProps {
  serviceRequest: any
}

const statusLabels = {
  pending: "Beklemede",
  in_progress: "Tamirde",
  completed: "Tamamlandı",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
}

const priorityLabels = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  urgent: "Acil",
}

export function ServiceDetailPrint({ serviceRequest }: ServiceDetailPrintProps) {
  const [open, setOpen] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Yazdır
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Servis Formu - #{serviceRequest.id}</DialogTitle>
          </DialogHeader>
          <div className="print-content">
            <div className="space-y-6 p-6">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold">SERVİS FORMU</h1>
                <p className="text-lg">Kayıt No: #{serviceRequest.id}</p>
                <p className="text-sm text-muted-foreground">
                  Tarih: {new Date(serviceRequest.received_date).toLocaleDateString("tr-TR")}
                </p>
              </div>

              {/* Müşteri ve Ürün Bilgileri */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Müşteri Bilgileri</h3>
                  <div>
                    <p className="font-medium">Müşteri Adı:</p>
                    <p>{serviceRequest.customer_name || "Bilinmeyen Müşteri"}</p>
                  </div>
                  {serviceRequest.customer_phone && (
                    <div>
                      <p className="font-medium">Telefon:</p>
                      <p>{serviceRequest.customer_phone}</p>
                    </div>
                  )}
                  {serviceRequest.customer_email && (
                    <div>
                      <p className="font-medium">E-posta:</p>
                      <p>{serviceRequest.customer_email}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Ürün Bilgileri</h3>
                  <div>
                    <p className="font-medium">Ürün Adı:</p>
                    <p>{serviceRequest.product_name}</p>
                  </div>
                  {serviceRequest.product_stock_code && (
                    <div>
                      <p className="font-medium">Stok Kodu:</p>
                      <p>{serviceRequest.product_stock_code}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Arıza Açıklaması */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">Arıza Açıklaması</h3>
                <div className="min-h-[100px] p-3 border rounded">
                  <p className="whitespace-pre-wrap">{serviceRequest.fault_description}</p>
                </div>
              </div>

              {/* Servis Detayları */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Servis Detayları</h3>
                  <div>
                    <p className="font-medium">Durum:</p>
                    <p>{statusLabels[serviceRequest.status as keyof typeof statusLabels]}</p>
                  </div>
                  <div>
                    <p className="font-medium">Öncelik:</p>
                    <p>{priorityLabels[serviceRequest.priority as keyof typeof priorityLabels]}</p>
                  </div>
                  {serviceRequest.technician_name && (
                    <div>
                      <p className="font-medium">Teknisyen:</p>
                      <p>{serviceRequest.technician_name}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Maliyet Bilgileri</h3>
                  {serviceRequest.estimated_cost && (
                    <div>
                      <p className="font-medium">Tahmini Maliyet:</p>
                      <p>₺{Number.parseFloat(serviceRequest.estimated_cost).toFixed(2)}</p>
                    </div>
                  )}
                  {serviceRequest.actual_cost && (
                    <div>
                      <p className="font-medium">Gerçek Maliyet:</p>
                      <p>₺{Number.parseFloat(serviceRequest.actual_cost).toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Servis Notları */}
              {serviceRequest.service_notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Servis Notları</h3>
                  <div className="min-h-[80px] p-3 border rounded">
                    <p className="whitespace-pre-wrap">{serviceRequest.service_notes}</p>
                  </div>
                </div>
              )}

              {/* İmza Alanları */}
              <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t">
                <div className="text-center">
                  <div className="border-b border-gray-400 mb-2 pb-8"></div>
                  <p className="font-medium">Müşteri İmzası</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 mb-2 pb-8"></div>
                  <p className="font-medium">Teknisyen İmzası</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Yazdır
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
