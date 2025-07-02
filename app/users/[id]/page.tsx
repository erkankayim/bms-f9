import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, ArrowLeft } from "lucide-react"
import { getCurrentUserRole, getUserById } from "../_actions/users-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

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
  const role = await getCurrentUserRole()

  if (role !== "admin") {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Yetkisiz Erişim</AlertTitle>
          <AlertDescription>Bu sayfayı görüntüleme yetkiniz yok.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { user, error } = await getUserById(params.id)

  if (error || !user) {
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
        <h1 className="text-3xl font-bold">Kullanıcı Detayı</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{user.full_name || "N/A"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/users/${user.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Rol</h3>
                <Badge variant={user.role === "admin" ? "default" : user.role === "acc" ? "secondary" : "outline"}>
                  {roleLabels[user.role]}
                </Badge>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Durum</h3>
                <Badge variant={user.status === "active" ? "default" : "destructive"}>
                  {statusLabels[user.status]}
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Oluşturulma Tarihi</h3>
              <p>{new Date(user.created_at).toLocaleString("tr-TR")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
