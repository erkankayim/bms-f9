"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckCircle, Clock, XCircle, RotateCcw, ChevronDown, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { updateSaleStatusAction } from "../../new/_actions/sales-actions"
import { useRouter } from "next/navigation"

interface SaleStatusActionsProps {
  saleId: number
  currentStatus: string
}

export function SaleStatusActions({ saleId, currentStatus }: SaleStatusActionsProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return

    setIsUpdating(true)
    const result = await updateSaleStatusAction(saleId, newStatus)
    setIsUpdating(false)

    if (result.success) {
      toast({
        title: "Durum Güncellendi",
        description: `Satış durumu başarıyla güncellendi.`,
      })
      router.refresh()
    } else {
      toast({
        title: "Hata",
        description: result.error || "Durum güncellenemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    }
  }

  // Mevcut duruma göre buton rengini belirle
  const getButtonVariant = () => {
    switch (currentStatus) {
      case "completed":
        return "success"
      case "pending":
        return "warning"
      case "cancelled":
        return "destructive"
      case "refunded":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Mevcut duruma göre buton içeriğini belirle
  const getButtonContent = () => {
    if (isUpdating) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Güncelleniyor...
        </>
      )
    }

    switch (currentStatus) {
      case "completed":
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4" /> Tamamlandı
          </>
        )
      case "pending":
        return (
          <>
            <Clock className="mr-2 h-4 w-4" /> Beklemede
          </>
        )
      case "cancelled":
        return (
          <>
            <XCircle className="mr-2 h-4 w-4" /> İptal Edildi
          </>
        )
      case "refunded":
        return (
          <>
            <RotateCcw className="mr-2 h-4 w-4" /> İade Edildi
          </>
        )
      default:
        return currentStatus
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={getButtonVariant()} size="sm" disabled={isUpdating}>
          {getButtonContent()}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("pending")} disabled={currentStatus === "pending"}>
          <Clock className="mr-2 h-4 w-4" />
          Beklemede
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("completed")} disabled={currentStatus === "completed"}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Tamamlandı
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("cancelled")} disabled={currentStatus === "cancelled"}>
          <XCircle className="mr-2 h-4 w-4" />
          İptal Et
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("refunded")} disabled={currentStatus === "refunded"}>
          <RotateCcw className="mr-2 h-4 w-4" />
          İade Et
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
