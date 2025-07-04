import { getUsers } from "../_actions/users-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
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
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{user.full_name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <div className="flex gap-2">
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/users/${user.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Görüntüle
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/users/${user.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Düzenle
                  </Link>
                </Button>
                <DeleteUserDialog userId={user.id} userName={user.full_name} />
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
