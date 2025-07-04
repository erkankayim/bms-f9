import { notFound } from "next/navigation"
import { getUser } from "@/app/users/_actions/user-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface UserPageProps {
  params: Promise<{ id: string }>
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params
  const user = await getUser(id)

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{user.full_name}</CardTitle>
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
              <Badge variant="outline">
                {user.role === "admin" ? "Yönetici" : user.role === "acc" ? "Muhasebe" : "Teknisyen"}
              </Badge>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Durum</h3>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status === "active" ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Oluşturulma Tarihi</h3>
            <p>{new Date(user.created_at).toLocaleDateString("tr-TR")}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Son Güncelleme</h3>
            <p>{new Date(user.updated_at).toLocaleDateString("tr-TR")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
