import { getUsers } from "../_actions/users-actions"
import { DeleteUserDialog } from "./delete-user-dialog"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const roleLabels = {
  admin: "Yönetici",
  tech: "Teknisyen",
  acc: "Muhasebe",
}

const roleColors = {
  admin: "destructive",
  tech: "default",
  acc: "secondary",
} as const

export async function UsersList() {
  const users = await getUsers()

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Henüz kullanıcı bulunmuyor.</p>
        <Button asChild className="mt-4">
          <Link href="/users/new">İlk kullanıcıyı ekle</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Kayıt Tarihi</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name || "İsimsiz Kullanıcı"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString("tr-TR")}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/users/${user.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteUserDialog userId={user.id} userName={user.full_name || user.email} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
