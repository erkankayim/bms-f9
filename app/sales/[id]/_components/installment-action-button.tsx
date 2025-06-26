"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"
import { markInstallmentAsPaidAction } from "../../new/_actions/sales-actions" // Action'ı import et

interface InstallmentActionButtonProps {
  installmentId: number
  currentStatus: string
  saleId: number // Ana satış ID'si, revalidate ve diğer işlemler için
}

export function InstallmentActionButton({ installmentId, currentStatus, saleId }: InstallmentActionButtonProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleMarkAsPaid = async () => {
    setIsUpdating(true)
    const result = await markInstallmentAsPaidAction(installmentId, saleId)
    setIsUpdating(false)

    if (result.success) {
      toast({
        title: "Taksit Güncellendi",
        description: `Taksit #${installmentId} başarıyla "ödendi" olarak işaretlendi.`,
        variant: "success",
      })
      router.refresh() // Sayfayı yenileyerek güncel durumu göster
    } else {
      toast({
        title: "Güncelleme Hatası",
        description: result.error || "Taksit güncellenemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    }
  }

  if (currentStatus === "paid") {
    return (
      <div className="flex items-center text-green-600 text-xs">
        <CheckCircle className="mr-1 h-4 w-4" />
        Ödendi
      </div>
    )
  }

  return (
    <Button
      size="xs" // shadcn/ui Button'da 'xs' size default olarak yok, özel CSS gerekebilir veya 'sm' kullanın
      variant="outline"
      onClick={handleMarkAsPaid}
      disabled={isUpdating || currentStatus === "paid"}
      className="text-xs px-2 py-1 h-auto" // 'xs' size için manuel stil
    >
      {isUpdating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <CheckCircle className="mr-1 h-3 w-3" />}
      {isUpdating ? "İşleniyor..." : "Ödendi İşaretle"}
    </Button>
  )
}
