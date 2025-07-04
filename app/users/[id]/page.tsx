import { getCurrentUserRole, getUserById } from "../_actions/users-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"

interface UserDetailPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const userRole = await getCurrentUserRole()

  if (userRole !== "admin") {
    redirect("/")
  }

  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Kullanıcı Detayı</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{user.full_name}</CardTitle>
            <Button asChild>
              <Link href={`/users/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">E-posta</label>
            <p className="text-lg">{user.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Rol</label>
            <div className="mt-1">
              <Badge variant="outline">
                {user.role === "admin" ? "Yönetici" : user.role === "acc" ? "Muhasebe" : "Teknisyen"}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Durum</label>
            <div className="mt-1">
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status === "active" ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</label>
            <p className="text-lg">{new Date(user.created_at).toLocaleDateString("tr-TR")}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Son Güncelleme</label>
            <p className="text-lg">{new Date(user.updated_at).toLocaleDateString("tr-TR")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
