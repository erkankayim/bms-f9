"use client"

import { deleteAccountAction, toggleAccountStatusAction } from "../_actions/server-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

export type ChartOfAccount = {
  id: string
  code: string
  name: string
  type: string
  parent_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Props {
  accounts: ChartOfAccount[]
}

export function AccountsTableClient({ accounts }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [confirm, setConfirm] = useState<ChartOfAccount | null>(null)
  const [working, setWorking] = useState(false)

  // Ensure accounts is always an array
  const safeAccounts = Array.isArray(accounts) ? accounts : []

  const toggleStatus = async (acc: ChartOfAccount) => {
    setWorking(true)
    try {
      await toggleAccountStatusAction(acc.id, !acc.is_active)
      toast({
        title: "Başarılı",
        description: `Hesap ${!acc.is_active ? "aktif" : "pasif"} hale getirildi.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hesap durumu değiştirilirken bir hata oluştu.",
        variant: "destructive",
      })
    }
    setWorking(false)
  }

  const remove = async () => {
    if (!confirm) return
    setWorking(true)
    try {
      await deleteAccountAction(confirm.id)
      toast({
        title: "Başarılı",
        description: "Hesap başarıyla silindi.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hesap silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
    setConfirm(null)
    setWorking(false)
  }

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      asset: "Varlık",
      liability: "Borç",
      equity: "Özkaynak",
      revenue: "Gelir",
      expense: "Gider",
    }
    return typeMap[type] || type
  }

  const getTypeBadgeVariant = (type: string) => {
    const variantMap: Record<string, any> = {
      asset: "default",
      liability: "secondary",
      equity: "outline",
      revenue: "default",
      expense: "destructive",
    }
    return variantMap[type] || "default"
  }

  if (safeAccounts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Henüz hesap bulunmuyor.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kod</TableHead>
            <TableHead>Hesap Adı</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeAccounts.map((acc) => (
            <TableRow key={acc.id}>
              <TableCell className="font-medium">{acc.code}</TableCell>
              <TableCell>{acc.name}</TableCell>
              <TableCell>
                <Badge variant={getTypeBadgeVariant(acc.type)}>{getTypeLabel(acc.type)}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={acc.is_active ? "default" : "secondary"}>{acc.is_active ? "Aktif" : "Pasif"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Menüyü aç</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/financials/chart-of-accounts/${acc.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Düzenle
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatus(acc)} disabled={working}>
                      {acc.is_active ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4" /> Pasif Yap
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" /> Aktif Yap
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setConfirm(acc)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesap Silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. <strong>{confirm?.name}</strong> adlı hesap silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>İptal</AlertDialogCancel>
            <Button onClick={remove} disabled={working} variant="destructive">
              {working ? "Siliniyor…" : "Sil"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
