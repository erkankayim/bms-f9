"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { toggleAccountStatusAction, deleteAccountAction } from "../_actions/server-actions"
import { toast } from "@/hooks/use-toast"

interface Account {
  id: string
  code: string
  name: string
  type: string
  parent_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AccountsTableClientProps {
  accounts: Account[]
}

export function AccountsTableClient({ accounts }: AccountsTableClientProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async (account: Account) => {
    setIsLoading(true)
    try {
      await toggleAccountStatusAction(account.id, !account.is_active)
      toast({
        title: "Başarılı",
        description: `Hesap ${!account.is_active ? "aktif" : "pasif"} hale getirildi.`,
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hesap durumu değiştirilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return

    setIsLoading(true)
    try {
      await deleteAccountAction(accountToDelete.id)
      toast({
        title: "Başarılı",
        description: "Hesap başarıyla silindi.",
      })
      setDeleteDialogOpen(false)
      setAccountToDelete(null)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hesap silinirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Varlık":
        return "bg-green-100 text-green-800"
      case "Yükümlülük":
        return "bg-red-100 text-red-800"
      case "Özkaynak":
        return "bg-blue-100 text-blue-800"
      case "Gelir":
        return "bg-emerald-100 text-emerald-800"
      case "Gider":
        return "bg-orange-100 text-orange-800"
      case "Satılan Malın Maliyeti":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Henüz hesap bulunmuyor.</p>
        <p className="text-sm mt-2">İlk hesabınızı eklemek için "Yeni Hesap" butonuna tıklayın.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kod</TableHead>
              <TableHead>Hesap Adı</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Oluşturma Tarihi</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono font-medium">{account.code}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{account.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeColor(account.type)} variant="secondary">
                    {account.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={account.is_active ? "default" : "secondary"}>
                    {account.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(account.created_at).toLocaleDateString("tr-TR")}</TableCell>
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
                        <Link href={`/financials/chart-of-accounts/${account.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(account)} disabled={isLoading}>
                        {account.is_active ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Pasif Yap
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Aktif Yap
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setAccountToDelete(account)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-red-600"
                        disabled={isLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu hesabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              <br />
              <strong>
                Hesap: {accountToDelete?.code} - {accountToDelete?.name}
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
