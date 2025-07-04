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

    if (!users || users.length === 0) {
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
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{user.full_name}</CardTitle>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">E-posta</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/users/${user.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/users/${user.id}/edit`}>
                      <Edit className="h-4 w-4" />
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
    console.error("Error loading users:", error)
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Kullanıcılar yüklenirken hata oluştu: {error instanceof Error ? error.message : "Bilinmeyen hata"}
          </div>
        </CardContent>
      </Card>
    )
  }
}
