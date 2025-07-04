import { getCurrentUserRole, getUser } from "../_actions/user-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Edit, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"

interface UserPageProps {
  params: {
    id: string
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const currentUserRole = await getCurrentUserRole()

  if (currentUserRole !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu sayfaya erişim için yönetici yetkisi gereklidir.
            <br />
            Mevcut rol: {currentUserRole || "Bilinmiyor"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const user = await getUser(params.id)

  if (!user) {
    notFound()
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Yönetici</Badge>
      case "acc":
        return <Badge variant="secondary">Muhasebe</Badge>
      case "tech":
        return <Badge variant="outline">Teknisyen</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? <Badge variant="default">Aktif</Badge> : <Badge variant="secondary">Pasif</Badge>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Kullanıcı Detayları</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{user.full_name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <Link href={`/users/${user.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Rol</h3>
                {getRoleBadge(user.role)}
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Durum</h3>
                {getStatusBadge(user.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Oluşturulma Tarihi</h3>
                <p className="text-sm">{new Date(user.created_at).toLocaleDateString("tr-TR")}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Son Güncelleme</h3>
                <p className="text-sm">{new Date(user.updated_at).toLocaleDateString("tr-TR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
