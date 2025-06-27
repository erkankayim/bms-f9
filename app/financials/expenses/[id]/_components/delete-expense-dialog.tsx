"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"

import { deleteExpense } from "../../_actions/expense-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface DeleteExpenseDialogProps {
  expenseId: string | number
  expenseTitle: string
}

export function DeleteExpenseDialog({ expenseId, expenseTitle }: DeleteExpenseDialogProps) {
  const [pending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const onConfirm = () =>
    startTransition(async () => {
      const { error } = await deleteExpense(expenseId)
      if (error) {
        toast({ variant: "destructive", title: "Silinemedi", description: error.message })
        return
      }
      toast({ variant: "default", title: "Gider silindi" })
      router.push("/financials/expenses")
    })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gideri Sil</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{expenseTitle}</span> başlıklı gider kalıcı olarak silinecek. Emin misiniz?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2">
          <Button disabled={pending} variant="outline">
            Vazgeç
          </Button>
          <Button disabled={pending} variant="destructive" onClick={onConfirm}>
            {pending ? <Loader2 className="animate-spin h-4 w-4" /> : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
