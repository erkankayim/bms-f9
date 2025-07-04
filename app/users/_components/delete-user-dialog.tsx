"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import type { UserWithAuth } from "@/lib/auth"

interface DeleteUserDialogProps {
  user: UserWithAuth
  onDelete: (id: string) => Promise<{ success?: string; error?: string }>
}

export function DeleteUserDialog({ user, onDelete }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsPending(true)
    setError(null)

    try {
      const result = await onDelete(user.id.toString())

      if (result.success) {
        setOpen(false)
        // Başarı mesajı parent component'te gösterilecek
      } else if (result.error) {
        setError(result.error)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bir hata oluştu")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Kullanıcıyı Sil
          </DialogTitle>
          <DialogDescription>
            <strong>{user.full_name}</strong> kullanıcısını silmek istediğinizden emin misiniz?
            <br />
            Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            İptal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
