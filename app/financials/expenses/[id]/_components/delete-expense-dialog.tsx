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
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { deleteExpenseEntry } from "../../../_actions/financial-entries-actions"

interface DeleteExpenseDialogProps {
  expenseId: number
  expenseTitle: string
}

export function DeleteExpenseDialog({ expenseId, expenseTitle }: DeleteExpenseDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteExpenseEntry(expenseId)

      if (result.success) {
        toast.success(result.message)
        router.push("/financials/expenses")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Gider silinirken beklenmeyen bir hata oluştu")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent">
          <Trash2 className="mr-2 h-4 w-4" />
          Sil
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Gider Kaydını Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>"{expenseTitle}"</strong> başlıklı gider kaydını silmek istediğinizden emin misiniz?
            <br />
            <br />
            Bu işlem geri alınamaz ve gider kaydı kalıcı olarak silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Siliniyor...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
