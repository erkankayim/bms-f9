import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, ArrowLeft } from "lucide-react"
import { getUser } from "../_actions/user-actions"
import { requireRole } from "@/lib/auth"

interface UserDetailPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  // Admin yetkisi kontrolü
  await requireRole("admin")

  const user = await getUser(params.id)

  if (!user) {
    notFound()
  }

  const getRoleBadge = (role: string) => {
    const roleMap = {
      admin: { label: "Yönetici", variant: "destructive" as const },
      acc: { label: "Muhasebe", variant: "secondary" as const },
      tech: { label: "Teknisyen", variant: "default" as const },
    }
    const roleInfo = roleMap[role as keyof typeof roleMap] || { label: role, variant: "outline" as const }
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>{status === "active" ? "Aktif" : "Pasif"}</Badge>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{user.full_name}</h1>
          <p className="text-muted-foreground">Kullanıcı detayları</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Kullanıcı Bilgileri</CardTitle>
              <Link href={`/users/${user.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Button>
              </Link>
            </div>
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
              <div className="mt-1">{getRoleBadge(user.role)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Durum</label>
              <div className="mt-1">{getStatusBadge(user.status)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kullanıcı ID</label>
              <p className="text-sm font-mono bg-muted p-2 rounded">{user.user_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</label>
              <p className="text-lg">
                {user.created_at ? new Date(user.created_at).toLocaleString("tr-TR") : "Bilinmiyor"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Son Güncelleme</label>
              <p className="text-lg">
                {user.updated_at ? new Date(user.updated_at).toLocaleString("tr-TR") : "Bilinmiyor"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
