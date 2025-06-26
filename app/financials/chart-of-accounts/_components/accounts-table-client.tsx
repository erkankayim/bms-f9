"use client"

import { deleteAccountAction, toggleAccountStatusAction, type AccountType } from "../_actions/server-actions"
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
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

/* ——— TYPES ——— */
export type ChartOfAccount = {
  id: number
  account_code: string
  account_name: string
  account_type: AccountType
  parent_account: { id: number; account_code: string; account_name: string } | null
  is_active: boolean
}

/* ——— COMPONENT ——— */
interface Props {
  accounts: ChartOfAccount[]
}

export function AccountsTableClient({ accounts }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [confirm, setConfirm] = useState<ChartOfAccount | null>(null)
  const [working, setWorking] = useState(false)

  const toggleStatus = async (acc: ChartOfAccount) => {
    setWorking(true)
    const res = await toggleAccountStatusAction(acc.id, !acc.is_active)
    setWorking(false)
    toast({
      title: res.success ? "Başarılı" : "Hata",
      description: res.message ?? "",
      variant: res.success ? "default" : "destructive",
    })
    if (res.success) router.refresh()
  }

  const remove = async () => {
    if (!confirm) return
    setWorking(true)
    const res = await deleteAccountAction(confirm.id)
    setWorking(false)
    toast({
      title: res.success ? "Başarılı" : "Hata",
      description: res.message ?? "",
      variant: res.success ? "default" : "destructive",
    })
    setConfirm(null)
    if (res.success) router.refresh()
  }

  const badgeVariant = (t: AccountType) =>
    ({
      Asset: "default",
      Liability: "secondary",
      Equity: "outline",
      Revenue: "success",
      Expense: "destructive",
      "Cost of Goods Sold": "warning",
    })[t]

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kod</TableHead>
            <TableHead>Hesap Adı</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Üst Hesap</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((acc) => (
            <TableRow key={acc.id}>
              <TableCell className="font-medium">{acc.account_code}</TableCell>
              <TableCell>{acc.account_name}</TableCell>
              <TableCell>
                <Badge variant={badgeVariant(acc.account_type)}>{acc.account_type}</Badge>
              </TableCell>
              <TableCell>
                {acc.parent_account ? `${acc.parent_account.account_code} - ${acc.parent_account.account_name}` : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={acc.is_active ? "success" : "secondary"}>{acc.is_active ? "Aktif" : "Pasif"}</Badge>
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
                    <DropdownMenuItem onClick={() => toggleStatus(acc)}>
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

      {/* confirm dialog */}
      <AlertDialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesap Silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. <strong>{confirm?.account_name}</strong> adlı hesap silinecek.
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
