import { getCurrentUserRole, getUserById } from "../_actions/users-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{user.full_name}</CardTitle>
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
              <h3 className="font-semibold mb-2">Rol</h3>
              <Badge variant={user.role === "admin" ? "default" : user.role === "acc" ? "secondary" : "outline"}>
                {user.role === "admin" ? "Yönetici" : user.role === "acc" ? "Muhasebe" : "Teknisyen"}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Durum</h3>
              <Badge variant={user.status === "active" ? "default" : "destructive"}>
                {user.status === "active" ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Oluşturulma Tarihi</h3>
              <p className="text-sm text-muted-foreground">
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
              <h3 className="font-semibold mb-2">Son Güncelleme</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(user.updated_at).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
