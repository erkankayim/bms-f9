"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { deleteSupplierAction } from "../new/_actions/suppliers-actions" // Doğru yoldan import edildi
import { Loader2 } from "lucide-react"

interface DeleteSupplierDialogProps {
  supplierId: string
  supplierName: string | null
  onDelete?: () => void
  children?: React.ReactNode // Trigger butonu için
  open?: boolean // Dialog'un açık/kapalı durumunu dışarıdan kontrol etmek için
  onOpenChange?: (open: boolean) => void // Dialog'un açık/kapalı durumu değiştiğinde çağrılacak fonksiyon
}

export function DeleteSupplierDialog({
  supplierId,
  supplierName,
  onDelete,
  children,
  open,
  onOpenChange,
}: DeleteSupplierDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteSupplierAction(supplierId)
    setIsDeleting(false)

    if (result.success) {
      toast({
        title: "Tedarikçi Arşivlendi",
        description: `Tedarikçi "${supplierName || supplierId}" başarıyla arşivlendi.`,
      })
      setIsOpen(false)
      if (onDelete) {
        onDelete()
      } else {
        router.push("/suppliers")
        router.refresh()
      }
    } else {
      toast({
        title: "Tedarikçi Arşivleme Hatası",
        description: result.error || "Tedarikçi arşivlenemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    }
  }

  const trigger = children ? <AlertDialogTrigger asChild>{children}</AlertDialogTrigger> : null

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tedarikçiyi Arşivlemek İstediğinizden Emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem, "<span className="font-semibold">{supplierName || supplierId}</span>" adlı tedarikçiyi
            arşivleyecektir. Arşivlenen tedarikçiler listelenmeyecek ancak sistemden kalıcı olarak silinmeyecektir.
            Gerekirse daha sonra geri yüklenebilir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Arşivleniyor...
              </>
            ) : (
              "Evet, Arşivle"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
