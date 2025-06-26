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
import { Trash2 } from "lucide-react"
import { deleteServiceRequest } from "../_actions/service-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DeleteServiceDialogProps {
  serviceId: number
  serviceName: string
}

export function DeleteServiceDialog({ serviceId, serviceName }: DeleteServiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteServiceRequest(serviceId)
      toast.success("Servis kaydı başarıyla silindi")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Servis kaydı silinirken bir hata oluştu")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Servis Kaydını Sil</DialogTitle>
          <DialogDescription>
            <strong>{serviceName}</strong> için olan servis kaydını silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
