"use client"

import { useState } from "react"
import { Trash2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import { deleteCustomer, restoreCustomer } from "../_actions/actions"

interface DeleteCustomerDialogProps {
  customerId: string
  customerName: string
  isDeleted?: boolean
}

export function DeleteCustomerDialog({ customerId, customerName, isDeleted = false }: DeleteCustomerDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      console.log("Starting delete process for:", customerId)

      const result = await deleteCustomer(customerId)

      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
        // Sayfayı yenile
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Beklenmeyen bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async () => {
    try {
      setIsLoading(true)
      console.log("Starting restore process for:", customerId)

      const result = await restoreCustomer(customerId)

      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
        // Sayfayı yenile
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Restore error:", error)
      toast.error("Beklenmeyen bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  if (isDeleted) {
    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Geri Yükle
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteriyi Geri Yükle</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{customerName}</strong> müşterisini geri yüklemek istediğinizden emin misiniz? Bu işlem müşteriyi
              aktif duruma getirecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Geri Yükleniyor..." : "Geri Yükle"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Sil
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{customerName}</strong> müşterisini silmek istediğinizden emin misiniz? Bu işlem müşteriyi
            arşivleyecektir ve daha sonra geri yükleyebilirsiniz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
            {isLoading ? "Siliniyor..." : "Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
