import { getUserById } from "../_actions/users-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface UserDetailPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kullanıcılara Dön
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/users/${user.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{user.full_name}</CardTitle>
          <CardDescription>Kullanıcı Detayları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div>
            <label className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</label>
            <p className="text-lg">{new Date(user.created_at).toLocaleString("tr-TR")}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Son Güncelleme</label>
            <p className="text-lg">{new Date(user.updated_at).toLocaleString("tr-TR")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
