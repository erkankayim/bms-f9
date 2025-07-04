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
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { deleteSaleAction } from "../../new/_actions/sales-actions"

interface DeleteSaleDialogProps {
  saleId: number
  onDelete?: () => void
}

export const DeleteSaleDialog: React.FC<DeleteSaleDialogProps> = ({ saleId, onDelete }) => {
  const { toast } = useToast()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteSaleAction(saleId)
    setIsDeleting(false)

    if (result.success) {
      toast({
        title: "Satış Arşivlendi",
        description: `Satış #${saleId} başarıyla arşivlendi.`,
      })
      setIsOpen(false)
      if (onDelete) {
        onDelete()
      } else {
        router.push("/sales") // Satış listesine yönlendir
        router.refresh()
      }
    } else {
      toast({
        title: "Satış Arşivleme Hatası",
        description: result.error || "Satış arşivlenemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-1 h-4 w-4" /> Arşivle
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Satışı Arşivlemek İstediğinizden Emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem, Satış #{saleId} kaydını arşivleyecektir. Arşivlenen satışlar listelenmeyecek ancak sistemden
            kalıcı olarak silinmeyecektir. Gerekirse daha sonra geri yüklenebilir.
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
