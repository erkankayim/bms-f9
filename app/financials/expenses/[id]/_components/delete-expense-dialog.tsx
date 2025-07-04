"use client"

import { useState } from "react"
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
import { Trash2 } from "lucide-react"
import { deleteExpense } from "../_actions/expense-actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface DeleteExpenseDialogProps {
  expenseId: string
  expenseTitle: string
}

export function DeleteExpenseDialog({ expenseId, expenseTitle }: DeleteExpenseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteExpense(expenseId)

      toast({
        title: "Başarılı",
        description: `${expenseTitle} adlı gider başarıyla silindi`,
        duration: 1500,
      })

      router.push("/financials/expenses")
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Gider silinirken hata oluştu",
        variant: "destructive",
        duration: 1500,
      })
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Sil
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Gideri Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{expenseTitle}</strong> adlı gideri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
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
