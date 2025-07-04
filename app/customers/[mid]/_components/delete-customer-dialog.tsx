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
    console.log("handleAction called with:", { customerId, customerName, isDeleted })
    console.log("deleteAction:", deleteAction)
    console.log("restoreAction:", restoreAction)

    if (!customerId || typeof customerId !== "string") {
      const errorMsg = "Geçersiz müşteri ID"
      console.error("Invalid customer ID:", customerId)
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!deleteAction || !restoreAction) {
      const errorMsg = "Action fonksiyonları bulunamadı"
      console.error("Missing action functions:", { deleteAction, restoreAction })
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`Attempting ${isDeleted ? "restore" : "delete"} for customer:`, customerId)

      const actionToCall = isDeleted ? restoreAction : deleteAction
      console.log("Action function to call:", actionToCall)

      if (typeof actionToCall !== "function") {
        throw new Error("Action is not a function")
      }

      const result = await actionToCall(customerId)
      console.log("Action result:", result)

      if (result && result.success) {
        toast.success(result.message || "İşlem başarılı")
        setOpen(false)
        // Sayfayı yenile
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        const errorMsg = result?.message || "İşlem başarısız oldu"
        setError(errorMsg)
        toast.error(errorMsg)
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

  // ID ve action kontrolü
  const isValidId = customerId && typeof customerId === "string" && customerId.trim().length > 0
  const hasValidActions = typeof deleteAction === "function" && typeof restoreAction === "function"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isDeleted ? "outline" : "destructive"} size="sm" disabled={!isValidId || !hasValidActions}>
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
            disabled={loading || !isValidId || !hasValidActions}
          >
            {loading ? "İşleniyor..." : isDeleted ? "Geri Yükle" : "Arşivle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
