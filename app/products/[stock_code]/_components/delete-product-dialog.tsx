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
  // AlertDialogTrigger, // Kaldırıldı
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
// import { useRouter } from "next/navigation"; // Eğer onDelete dışarıdan yönetiliyorsa, router'a burada gerek kalmayabilir.
import type { FC } from "react"

interface DeleteProductDialogProps {
  productId: string
  productName: string | null
  isOpen: boolean // Yeni prop
  onOpenChange: (open: boolean) => void // Yeni prop
  onDelete?: () => void
}

export const DeleteProductDialog: FC<DeleteProductDialogProps> = ({
  productId,
  productName,
  isOpen,
  onOpenChange,
  onDelete,
}) => {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    // products-actions içindeki deleteProductAction zaten soft delete yapıyor.
    // Bu action'ı doğrudan import etmek yerine, bir prop olarak almayı düşünebiliriz
    // veya mevcut importu kullanmaya devam edebiliriz. Şimdilik mevcut import kalsın.
    const { deleteProductAction } = await import("../../new/_actions/products-actions")
    const result = await deleteProductAction(productId)
    setIsDeleting(false)

    if (result.success) {
      toast({
        title: "Ürün Arşivlendi",
        description: `Ürün "${productName || productId}" başarıyla arşivlendi.`,
      })
      onOpenChange(false) // Dialog'u kapat
      if (onDelete) {
        onDelete() // Listeyi yenilemek vb. için üst component'teki fonksiyonu çağır
      }
    } else {
      toast({
        title: "Ürün Arşivleme Hatası",
        description: result.error || "Ürün arşivlenemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
      // Hata durumunda dialog açık kalabilir veya kapatılabilir, tercihe bağlı.
      // onOpenChange(false); // İstenirse hata durumunda da kapatılabilir.
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {/* AlertDialogTrigger kaldırıldığı için burası boş kalacak veya direkt AlertDialogContent render edilecek.
          Shadcn AlertDialog normalde bir trigger bekler ama open/onOpenChange ile kontrol edildiğinde
          doğrudan content render edilebilir. */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ürünü Arşivlemek İstediğinizden Emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem, "<span className="font-semibold">{productName || productId}</span>" adlı ürünü arşivleyecektir.
            Arşivlenen ürünler listelenmeyecek ancak sistemden kalıcı olarak silinmeyecektir. Gerekirse daha sonra geri
            yüklenebilir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={() => onOpenChange(false)}>
            İptal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Arşivleniyor..." : "Evet, Arşivle"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
