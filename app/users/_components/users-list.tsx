import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Eye } from "lucide-react"
import { getUsers } from "../_actions/users-actions"
import { DeleteUserDialog } from "./delete-user-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

const roleLabels = {
  admin: "Yönetici",
  acc: "Muhasebe",
  tech: "Teknisyen",
}

const statusLabels = {
  active: "Aktif",
  inactive: "Pasif",
}

export async function UsersList() {
  const { users, error } = await getUsers()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Oluşturulma</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : user.role === "acc" ? "secondary" : "outline"}>
                  {roleLabels[user.role]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === "active" ? "default" : "destructive"}>
                  {statusLabels[user.status]}
                </Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString("tr-TR")}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/users/${user.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
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
