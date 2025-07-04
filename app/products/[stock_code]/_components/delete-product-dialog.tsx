"use client"

import { useState } from "react"
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
import { Trash2, RotateCcw } from "lucide-react"
import { deleteProductAction, restoreProductAction } from "../../new/_actions/products-actions"
import { useToast } from "@/components/ui/use-toast"

interface DeleteProductDialogProps {
  productId: string
  productName: string
  isDeleted?: boolean
}

export function DeleteProductDialog({ productId, productName, isDeleted = false }: DeleteProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  async function handleAction() {
    setIsLoading(true)

    try {
      const result = isDeleted ? await restoreProductAction(productId) : await deleteProductAction(productId)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: isDeleted
            ? `${productName} adlı ürün başarıyla geri yüklendi`
            : `${productName} adlı ürün başarıyla arşivlendi`,
          variant: "default",
        })
        setOpen(false)
      } else if (result.error) {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          {isDeleted ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isDeleted ? "Ürünü Geri Yükle" : "Ürünü Arşivle"}</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{productName}</strong> adlı ürünü {isDeleted ? "geri yüklemek" : "arşivlemek"} istediğinizden emin
            misiniz?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={isLoading}
            className={isDeleted ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
          >
            {isLoading ? "İşleniyor..." : isDeleted ? "Geri Yükle" : "Arşivle"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
