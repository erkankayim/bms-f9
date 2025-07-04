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
import { Trash2, RotateCcw, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { deleteCustomer, restoreCustomer } from "../_actions/actions"

interface DeleteCustomerDialogProps {
  customerId: string
  customerName: string
  isDeleted?: boolean
}

export function DeleteCustomerDialog({ customerId, customerName, isDeleted = false }: DeleteCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    try {
      console.log(`Müşteri siliniyor: ${customerId}`)
      const result = await deleteCustomer(customerId)

      if (result.success) {
        toast.success("Müşteri başarıyla arşivlendi")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Müşteri silinemedi")
      }
    } catch (error) {
      console.error("Müşteri silme hatası:", error)
      toast.error("Beklenmeyen bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    setLoading(true)
    try {
      console.log(`Müşteri geri yükleniyor: ${customerId}`)
      const result = await restoreCustomer(customerId)

      if (result.success) {
        toast.success("Müşteri başarıyla geri yüklendi")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Müşteri geri yüklenemedi")
      }
    } catch (error) {
      console.error("Müşteri geri yükleme hatası:", error)
      toast.error("Beklenmeyen bir hata oluştu")
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
          <DialogTitle>{isDeleted ? "Müşteriyi Geri Yükle" : "Müşteriyi Sil"}</DialogTitle>
          <DialogDescription>
            {isDeleted
              ? `"${customerName}" müşterisini geri yüklemek istediğinizden emin misiniz?`
              : `"${customerName}" müşterisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            İptal
          </Button>
          <Button
            variant={isDeleted ? "default" : "destructive"}
            onClick={isDeleted ? handleRestore : handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isDeleted ? "Geri Yükleniyor..." : "Siliniyor..."}
              </>
            ) : isDeleted ? (
              "Geri Yükle"
            ) : (
              "Sil"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
