"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2, RotateCw, Loader2 } from "lucide-react"

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
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const action = isDeleted ? restoreAction : deleteAction
  const actionText = isDeleted ? "Geri Yükle" : "Arşivle"
  const title = isDeleted ? "Müşteriyi Geri Yükle" : "Müşteriyi Arşivle"
  const description = isDeleted
    ? `"${customerName}" adlı müşteriyi geri yüklemek istediğinizden emin misiniz? Müşteri tekrar aktif hale gelecektir.`
    : `"${customerName}" adlı müşteriyi arşivlemek istediğinizden emin misiniz? Bu işlem müşteriyi silmez, sadece arşivler.`

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await action(customerId)
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={isDeleted ? "outline" : "destructive"} size="sm">
          {isDeleted ? <RotateCw className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
          {actionText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isPending}
            className={!isDeleted ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
