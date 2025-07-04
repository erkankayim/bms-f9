import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, ArrowLeft } from "lucide-react"
import { getUser } from "../_actions/user-actions"
import { requireRole } from "@/lib/auth"

interface UserDetailPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  try {
    // Admin yetkisi kontrolü
    await requireRole(["admin"])
  } catch (error) {
    redirect("/auth/login")
  }

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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{user.full_name}</h1>
            <p className="text-muted-foreground">Kullanıcı Detayları</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kullanıcı Bilgileri</CardTitle>
                <CardDescription>Kullanıcının detaylı bilgileri</CardDescription>
              </div>
              <Link href={`/users/${user.id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</label>
                <p className="text-lg">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Son Güncelleme</label>
                <p className="text-lg">
                  {user.updated_at ? new Date(user.updated_at).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
