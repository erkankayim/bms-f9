import { getUsers } from "../_actions/users-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, AlertCircle } from "lucide-react"
import Link from "next/link"
import { DeleteUserDialog } from "./delete-user-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { UserProfile } from "@/app/lib/types"

const roleLabels: Record<UserProfile["role"], string> = {
  admin: "Yönetici",
  acc: "Muhasebe",
  tech: "Teknisyen",
}

const statusLabels: Record<UserProfile["status"], string> = {
  active: "Aktif",
  inactive: "Pasif",
}

const statusColors: Record<UserProfile["status"], "success" | "destructive"> = {
  active: "success",
  inactive: "destructive",
}

export async function UsersList() {
  const { users, error } = await getUsers()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Hata</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (users.length === 0) {
    return <p className="text-center text-muted-foreground">Kullanıcı bulunamadı.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ad Soyad</TableHead>
          <TableHead>E-posta</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.full_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{roleLabels[user.role]}</TableCell>
            <TableCell>
              <Badge variant={statusColors[user.status]}>{statusLabels[user.status]}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/users/${user.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteUserDialog userId={user.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
