import { getCurrentUserRole, getUserById } from "../_actions/user-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

interface UserDetailPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const currentRole = await getCurrentUserRole()

  if (currentRole !== "admin") {
    redirect("/users")
  }

  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Detayları</h1>
          <p className="text-muted-foreground">Kullanıcı bilgilerini görüntüleyin</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Genel Bilgiler</CardTitle>
            <CardDescription>Kullanıcının temel bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ad Soyad</label>
              <p className="text-lg font-medium">{user.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">E-posta</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rol</label>
              <div className="mt-1">
                <Badge variant={user.role === "admin" ? "default" : user.role === "acc" ? "secondary" : "outline"}>
                  {user.role === "admin" ? "Yönetici" : user.role === "acc" ? "Muhasebe" : "Teknisyen"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Durum</label>
              <div className="mt-1">
                <Badge variant={user.status === "active" ? "default" : "destructive"}>
                  {user.status === "active" ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistem Bilgileri</CardTitle>
            <CardDescription>Hesap oluşturma ve güncelleme tarihleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</label>
              <p className="text-lg">{new Date(user.created_at).toLocaleString("tr-TR")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Son Güncelleme</label>
              <p className="text-lg">{new Date(user.updated_at).toLocaleString("tr-TR")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kullanıcı ID</label>
              <p className="text-sm font-mono text-muted-foreground">{user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href={`/users/${user.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Link>
        </Button>
      </div>
    </div>
  )
}
