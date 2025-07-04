import { getUser } from "../_actions/user-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCurrentUserRole } from "@/lib/auth"

interface UserPageProps {
  params: Promise<{ id: string }>
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params
  const userRole = await getCurrentUserRole()

  if (userRole !== "admin") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Erişim Reddedildi</CardTitle>
            <CardDescription>Bu sayfaya erişim için yönetici yetkisi gereklidir.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const user = await getUser(id)

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
        <div>
          <h1 className="text-2xl font-bold">{user.full_name}</h1>
          <p className="text-muted-foreground">Kullanıcı Detayları</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Genel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ad Soyad</label>
              <p className="text-lg">{user.full_name}</p>
            </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</label>
              <p className="text-lg">{new Date(user.created_at).toLocaleDateString("tr-TR")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Son Güncelleme</label>
              <p className="text-lg">{new Date(user.updated_at).toLocaleDateString("tr-TR")}</p>
            </div>
            <div className="pt-4">
              <Button asChild>
                <Link href={`/users/${user.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
