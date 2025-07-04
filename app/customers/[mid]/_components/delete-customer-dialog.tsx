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

  const handleDelete = async () => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await deleteAction(customerId)

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        window.location.reload()
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (err) {
      console.error("Delete error:", err)
      const errorMessage = "Silme işlemi başarısız oldu"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await restoreAction(customerId)

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        window.location.reload()
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (err) {
      console.error("Restore error:", err)
      const errorMessage = "Geri yükleme işlemi başarısız oldu"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isDeleted ? "outline" : "destructive"} size="sm">
          {isDeleted ? (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Geri Yükle
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Sil
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {isDeleted ? "Müşteriyi Geri Yükle" : "Müşteriyi Sil"}
          </DialogTitle>
          <DialogDescription>
            {isDeleted ? (
              <>
                <strong>{customerName}</strong> müşterisini geri yüklemek istediğinizden emin misiniz?
              </>
            ) : (
              <>
                <strong>{customerName}</strong> müşterisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
            onClick={isDeleted ? handleRestore : handleDelete}
            disabled={loading}
          >
            {loading ? "İşleniyor..." : isDeleted ? "Geri Yükle" : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
