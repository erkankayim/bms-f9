"use client"

import { useEffect, useRef } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Trash2, RotateCcw } from "lucide-react"

type ActionResponse = {
  success: boolean
  message: string
} | null

type ServerAction = (prevState: any, formData: FormData) => Promise<{ success: boolean; message: string }>

// Butonun bekleme durumunu yönetmek için ayrı bir component
function SubmitButton({ isDeleted }: { isDeleted: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant={isDeleted ? "default" : "destructive"} disabled={pending}>
      {pending ? "İşleniyor..." : isDeleted ? "Geri Yükle" : "Arşivle"}
    </Button>
  )
}

interface DeleteCustomerDialogProps {
  customerId: string
  customerName: string
  isDeleted: boolean
  deleteAction: ServerAction
  restoreAction: ServerAction
}

export function DeleteCustomerDialog({
  customerId,
  customerName,
  isDeleted,
  deleteAction,
  restoreAction,
}: DeleteCustomerDialogProps) {
  const [state, formAction] = useFormState<ActionResponse, FormData>(isDeleted ? restoreAction : deleteAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(state.message)
        // Dialog'u kapatıp sayfayı yenilemek en basit ve güvenilir yöntem
        setTimeout(() => window.location.reload(), 500)
      } else {
        toast.error(state.message)
      }
    }
  }, [state])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isDeleted ? "outline" : "destructive"} size="sm">
          {isDeleted ? <RotateCcw className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
          {isDeleted ? "Geri Yükle" : "Arşivle"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isDeleted ? "Müşteriyi Geri Yükle" : "Müşteriyi Arşivle"}</DialogTitle>
          <DialogDescription>
            <strong>{customerName}</strong> isimli müşteriyi {isDeleted ? "geri yüklemek" : "arşivlemek"} istediğinizden
            emin misiniz?
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
          <input type="hidden" name="customerId" value={customerId} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                İptal
              </Button>
            </DialogClose>
            <SubmitButton isDeleted={isDeleted} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
