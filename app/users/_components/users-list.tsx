import { getUsers, getCurrentUserRole } from "../_actions/users-actions"
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
  admin: "bg-red-100 text-red-800",
  tech: "bg-blue-100 text-blue-800",
  acc: "bg-green-100 text-green-800",
}

export async function UsersList() {
  const users = await getUsers()
  const currentUserRole = await getCurrentUserRole()

  if (users.length === 0) {
    return <div className="text-center py-4">Henüz kullanıcı bulunmamaktadır.</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Oluşturulma Tarihi</TableHead>
            <TableHead className="w-[100px]">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name || "İsimsiz Kullanıcı"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={roleColors[user.role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}>
                  {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                </Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString("tr-TR")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/users/${user.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Düzenle</span>
                    </Link>
                  </Button>
                  {currentUserRole === "admin" && <DeleteUserDialog userId={user.id} userEmail={user.email} />}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
