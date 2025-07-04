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
import { deleteIncome } from "../_actions/income-actions"
import { toast } from "@/hooks/use-toast"

interface DeleteIncomeDialogProps {
  entryId: number
  entryDescription: string
}

export function DeleteIncomeDialog({ entryId, entryDescription }: DeleteIncomeDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteIncome(entryId)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Gelir kaydı başarıyla silindi.",
        })
        router.push("/financials/income")
      } else {
        toast({
          title: "Hata",
          description: result.error || "Gelir kaydı silinirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting income:", error)
      toast({
        title: "Hata",
        description: "Gelir kaydı silinirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Gelir Kaydını Sil</AlertDialogTitle>
          <AlertDialogDescription>
            "{entryDescription}" gelir kaydını silmek istediğinizden emin misiniz?
            <br />
            Bu işlem geri alınamaz.
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
