"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface DeleteCustomerDialogProps {
  customerId: string
  customerName: string
  isDeleted: boolean
  deleteAction: (customerId: string) => Promise<{ success: boolean; message: string }>
  restoreAction: (customerId: string) => Promise<{ success: boolean; message: string }>
}

export function DeleteCustomerDialog({
  customerId,
  customerName,
  isDeleted,
  deleteAction,
  restoreAction,
}: DeleteCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async () => {
    if (!customerId) {
      setError("Müşteri ID bulunamadı")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`Attempting ${isDeleted ? "restore" : "delete"} for customer:`, customerId)

      const result = isDeleted ? await restoreAction(customerId) : await deleteAction(customerId)

      console.log("Action result:", result)

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        // Sayfayı yenile
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        setError(result.message || "İşlem başarısız oldu")
        toast.error(result.message || "İşlem başarısız oldu")
      }
    } catch (err) {
      console.error("Customer action error:", err)
      const errorMessage = "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isDeleted ? "outline" : "destructive"} size="sm" disabled={!customerId}>
          {isDeleted ? (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Geri Yükle
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Arşivle
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {isDeleted ? "Müşteriyi Geri Yükle" : "Müşteriyi Arşivle"}
          </DialogTitle>
          <DialogDescription>
            {isDeleted ? (
              <>
                <strong>{customerName}</strong> müşterisini geri yüklemek istediğinizden emin misiniz? Bu işlem
                müşteriyi aktif duruma getirecektir.
              </>
            ) : (
              <>
                <strong>{customerName}</strong> müşterisini arşivlemek istediğinizden emin misiniz? Bu işlem müşteriyi
                gizleyecek ancak veriler korunacaktır.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            İptal
          </Button>
          <Button
            variant={isDeleted ? "default" : "destructive"}
            onClick={handleAction}
            disabled={loading || !customerId}
          >
            {loading ? "İşleniyor..." : isDeleted ? "Geri Yükle" : "Arşivle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
