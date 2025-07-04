import { getUserById } from "../_actions/users-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft } from "lucide-react"
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
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{user.full_name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status === "active" ? "Aktif" : "Pasif"}
              </Badge>
              <Badge variant="outline">
                {user.role === "admin" ? "Yönetici" : user.role === "acc" ? "Muhasebe" : "Teknisyen"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Oluşturulma Tarihi</h3>
              <p>{new Date(user.created_at).toLocaleDateString("tr-TR")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Son Güncelleme</h3>
              <p>{new Date(user.updated_at).toLocaleDateString("tr-TR")}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button asChild>
              <Link href={`/users/${user.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
