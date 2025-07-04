import { getUsers } from "../_actions/users-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye } from "lucide-react"
import Link from "next/link"
import { DeleteUserDialog } from "./delete-user-dialog"

export async function UsersList() {
  try {
    const users = await getUsers()

    if (users.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Henüz kullanıcı bulunmuyor.</div>
          </CardContent>
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
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === "admin" ? "default" : user.role === "acc" ? "secondary" : "outline"}>
                    {user.role === "admin" ? "Yönetici" : user.role === "acc" ? "Muhasebe" : "Teknisyen"}
                  </Badge>
                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {user.status === "active" ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Oluşturulma: {new Date(user.created_at).toLocaleDateString("tr-TR")}
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/users/${user.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Görüntüle
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/users/${user.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Düzenle
                    </Link>
                  </Button>
                  <DeleteUserDialog userId={user.id} userName={user.full_name} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Kullanıcılar yüklenirken hata oluştu: {error instanceof Error ? error.message : "Bilinmeyen hata"}
          </div>
        </CardContent>
      </Card>
    )
  }
}
