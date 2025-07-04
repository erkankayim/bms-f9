import { Suspense } from "react"
import { UsersList } from "./_components/users-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUserRole, debugCurrentUser } from "@/lib/auth"

async function DebugInfo() {
  const debugInfo = await debugCurrentUser()
  return (
    <div className="mb-4">
      <details className="bg-gray-100 p-4 rounded">
        <summary className="cursor-pointer font-medium">Debug Bilgisi (Geliştirici)</summary>
        <pre className="mt-2 text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
      </details>
    </div>
  )
}

export default async function UsersPage() {
  // Rol kontrolü
  const userRole = await getCurrentUserRole()

  if (userRole !== "admin") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Erişim Reddedildi</CardTitle>
            <CardDescription>Bu sayfaya erişim için yönetici yetkisi gereklidir.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Yönetici hesabı ile giriş yapmanız gerekmektedir.</p>
            <p className="text-xs text-muted-foreground mt-2">Mevcut rol: {userRole || "Bilinmiyor"}</p>

            <Suspense fallback={<div>Debug bilgisi yükleniyor...</div>}>
              <DebugInfo />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcılar</h1>
          <p className="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
        </div>
        <Button asChild>
          <Link href="/users/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kullanıcı
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Kullanıcılar yükleniyor...</div>}>
        <UsersList />
      </Suspense>
    </div>
  )
}
