import { getUserById, getCurrentUserRole } from "../_actions/users-actions"
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

const roleLabels = {
  admin: "Yönetici",
  acc: "Muhasebe",
  tech: "Teknisyen",
}

const statusLabels = {
  active: "Aktif",
  inactive: "Pasif",
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
        <Button variant="ghost" size="sm" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Kullanıcı Detayı</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
            <Button asChild>
              <Link href={`/users/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ad Soyad</label>
                <p className="text-lg">{user.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rol</label>
                <div className="mt-1">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{roleLabels[user.role]}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Durum</label>
                <div className="mt-1">
                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {statusLabels[user.status]}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</label>
                <p className="text-lg">{new Date(user.created_at).toLocaleDateString("tr-TR")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Son Güncelleme</label>
                <p className="text-lg">{new Date(user.updated_at).toLocaleDateString("tr-TR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
