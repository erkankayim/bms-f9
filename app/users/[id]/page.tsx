import { getCurrentUserRole, getUser } from "@/app/users/_actions/user-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { DeleteUserDialog } from "../_components/delete-user-dialog"

interface UserPageProps {
  params: {
    id: string
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const currentRole = await getCurrentUserRole()
  const user = await getUser(params.id)

  if (!user) {
    notFound()
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "acc":
        return "secondary"
      case "tech":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Yönetici"
      case "acc":
        return "Muhasebe"
      case "tech":
        return "Teknisyen"
      default:
        return role
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    return status === "active" ? "default" : "secondary"
  }

  const getStatusText = (status: string) => {
    return status === "active" ? "Aktif" : "Pasif"
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
          <h1 className="text-3xl font-bold">{user.full_name}</h1>
          <p className="text-muted-foreground">Kullanıcı detayları</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
            <CardDescription>Kullanıcının temel bilgileri</CardDescription>
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
                <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleText(user.role)}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Durum</label>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(user.status)}>{getStatusText(user.status)}</Badge>
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
              <p className="text-lg">{new Date(user.created_at).toLocaleDateString("tr-TR")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Son Güncelleme</label>
              <p className="text-lg">{new Date(user.updated_at).toLocaleDateString("tr-TR")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kullanıcı ID</label>
              <p className="text-sm font-mono text-muted-foreground">{user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {currentRole === "admin" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>İşlemler</CardTitle>
            <CardDescription>Bu kullanıcı üzerinde yapabileceğiniz işlemler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild>
                <Link href={`/users/${user.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Link>
              </Button>
              <DeleteUserDialog user={user} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
