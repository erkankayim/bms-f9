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
import { deleteCustomer, restoreCustomer } from "../_actions/actions"
import { useToast } from "@/components/ui/use-toast"

interface DeleteCustomerDialogProps {
  customerId: string
  customerName: string
  isDeleted?: boolean
}

export function DeleteCustomerDialog({ customerId, customerName, isDeleted = false }: DeleteCustomerDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  async function handleAction() {
    setIsLoading(true)

    try {
      const result = isDeleted ? await restoreCustomer(customerId) : await deleteCustomer(customerId)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: result.message,
          variant: "default",
        })
        setOpen(false)
      } else {
        toast({
          title: "Hata",
          description: result.message,
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
          <AlertDialogTitle>{isDeleted ? "Müşteriyi Geri Yükle" : "Müşteriyi Arşivle"}</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{customerName}</strong> adlı müşteriyi {isDeleted ? "geri yüklemek" : "arşivlemek"} istediğinizden
            emin misiniz?
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
