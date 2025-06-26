import { getUsers } from "../_actions/users-actions"
import { DeleteUserDialog } from "./delete-user-dialog"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export async function UsersList() {
  const users = await getUsers()

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
            <TableHead>Oluşturulma Tarihi</TableHead>
            <TableHead className="w-[100px]">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.user_metadata?.full_name || "İsimsiz Kullanıcı"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString("tr-TR")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/users/${user.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Düzenle</span>
                    </Link>
                  </Button>
                  <DeleteUserDialog userId={user.id} userEmail={user.email} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
