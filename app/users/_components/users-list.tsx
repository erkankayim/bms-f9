import { getUsers } from "@/app/users/_actions/user-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Trash2 } from "lucide-react"
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
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{user.full_name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>
                    {user.status === "active" ? "Aktif" : "Pasif"}
                  </Badge>
                  <Badge variant="outline">
                    {user.role === "admin" ? "Yönetici" : user.role === "acc" ? "Muhasebe" : "Teknisyen"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/users/${user.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Görüntüle
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/users/${user.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Link>
                </Button>
                <DeleteUserDialog user={user}>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </Button>
                </DeleteUserDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hata</CardTitle>
          <CardDescription>Kullanıcılar yüklenirken bir hata oluştu.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error instanceof Error ? error.message : "Bilinmeyen hata"}</p>
        </CardContent>
      </Card>
    )
  }
}
