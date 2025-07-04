import { getCurrentUserProfile, getUserById } from "../_actions/users-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const currentUser = await getCurrentUserProfile()

  // Only admins can view user details
  if (!currentUser || currentUser.role !== "admin") {
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
        <h1 className="text-3xl font-bold">Kullanıcı Detayları</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
            <Button size="sm" asChild>
              <Link href={`/users/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Link>
            </Button>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kayıt Tarihi</label>
              <p className="text-lg">
                {new Date(user.created_at).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Son Güncelleme</label>
              <p className="text-lg">
                {new Date(user.updated_at).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Kullanıcı ID</label>
              <p className="text-sm font-mono bg-muted p-2 rounded">{user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
