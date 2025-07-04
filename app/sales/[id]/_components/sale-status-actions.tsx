"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, CheckCircle, Clock, XCircle, RotateCcw } from "lucide-react"
import { updateSaleStatusAction } from "../_actions/sale-actions"
import { toast } from "@/hooks/use-toast"

interface SaleStatusActionsProps {
  saleId: number
  currentStatus: string
}

const statusConfig = {
  pending: {
    label: "Beklemede",
    variant: "secondary" as const,
    icon: Clock,
  },
  completed: {
    label: "Tamamlandı",
    variant: "success" as const,
    icon: CheckCircle,
  },
  cancelled: {
    label: "İptal Edildi",
    variant: "destructive" as const,
    icon: XCircle,
  },
  refunded: {
    label: "İade Edildi",
    variant: "outline" as const,
    icon: RotateCcw,
  },
  pending_installment: {
    label: "Taksit Bekleniyor",
    variant: "warning" as const,
    icon: Clock,
  },
}

export function SaleStatusActions({ saleId, currentStatus }: SaleStatusActionsProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === currentStatus) return

    setIsUpdating(true)

    try {
      const result = await updateSaleStatusAction(saleId, newStatus)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Satış durumu güncellendi.",
        })
        router.refresh()
      } else {
        toast({
          title: "Hata",
          description: result.error || "Durum güncellenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating sale status:", error)
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const currentConfig = statusConfig[currentStatus as keyof typeof statusConfig]
  const CurrentIcon = currentConfig?.icon || Clock

  return (
    <div className="flex items-center gap-2">
      <Badge variant={currentConfig?.variant || "secondary"} className="flex items-center gap-1">
        <CurrentIcon className="h-3 w-3" />
        {currentConfig?.label || currentStatus}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isUpdating}>
            Durumu Değiştir
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={status === currentStatus}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {config.label}
                {status === currentStatus && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Mevcut
                  </Badge>
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
