"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Trash2 } from "lucide-react"
import { deleteSaleAction } from "../_actions/sale-actions"
import { toast } from "@/hooks/use-toast"

interface DeleteSaleDialogProps {
  saleId: number
  saleAmount: number
}

export function DeleteSaleDialog({ saleId, saleAmount }: DeleteSaleDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteSaleAction(saleId)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Satış başarıyla silindi.",
        })
        router.push("/sales")
      } else {
        toast({
          title: "Hata",
          description: result.error || "Satış silinirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting sale:", error)
      toast({
        title: "Hata",
        description: "Satış silinirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Sil
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Satışı Sil</AlertDialogTitle>
          <AlertDialogDescription>
            Bu satış kaydını silmek istediğinizden emin misiniz?
            <br />
            <strong>Tutar: ₺{saleAmount.toFixed(2)}</strong>
            <br />
            Bu işlem geri alınamaz ve tüm ilgili veriler silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
