import { getCurrentUserRole, getUserById } from "../_actions/users-actions"
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

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const userRole = await getCurrentUserRole()

  // Sadece adminler kullanıcı detaylarını görebilir
  if (userRole !== "admin") {
    redirect("/")
  }

  const { user, error } = await getUserById(params.id)

  if (error || !user) {
    notFound()
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      acc: "secondary",
      tech: "outline",
    } as const

    const labels = {
      admin: "Yönetici",
      acc: "Muhasebe",
      tech: "Teknisyen",
    } as const

    return (
      <Badge variant={variants[role as keyof typeof variants] || "outline"}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>{status === "active" ? "Aktif" : "Pasif"}</Badge>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Detayları</h1>
          <p className="text-muted-foreground">{user.full_name || user.email} kullanıcısının bilgileri</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
            <Link href={`/users/${user.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                <p className="text-lg">{user.full_name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">E-posta</label>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Rol</label>
                <div className="mt-1">{getRoleBadge(user.role)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Durum</label>
                <div className="mt-1">{getStatusBadge(user.status)}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</label>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
