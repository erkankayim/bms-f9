import { getUsers } from "../_actions/users-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Eye } from "lucide-react"
import Link from "next/link"
import { DeleteUserDialog } from "./delete-user-dialog"

export async function UsersList() {
  try {
    const users = await getUsers()

    if (users.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Bulunamadı</CardTitle>
            <CardDescription>Henüz hiç kullanıcı eklenmemiş.</CardDescription>
          </CardHeader>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ({users.length})</CardTitle>
          <CardDescription>Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : user.role === "acc" ? "secondary" : "outline"}>
                      {user.role === "admin" ? "Yönetici" : user.role === "acc" ? "Muhasebe" : "Teknisyen"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status === "active" ? "Aktif" : "Pasif"}
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
                      <DeleteUserDialog userId={user.id} userName={user.full_name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error("Error loading users:", error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hata</CardTitle>
          <CardDescription>Kullanıcılar yüklenirken bir hata oluştu.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Bilinmeyen hata"}</p>
        </CardContent>
      </Card>
    )
  }
}
