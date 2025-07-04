import { Suspense } from "react"
import { getCurrentUserRole, debugUserStatus, fixAdminProfile } from "./_actions/users-actions"
import { UsersList } from "./_components/users-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { redirect } from "next/navigation"

async function FixAdminButton() {
  async function handleFix() {
    "use server"
    const result = await fixAdminProfile()
    console.log("Fix result:", result)
    redirect("/users")
  }

  return (
    <form action={handleFix}>
      <Button type="submit" variant="outline">
        Admin Profilini Düzelt
      </Button>
    </form>
  )
}

export default async function UsersPage() {
  const userRole = await getCurrentUserRole()
  const debugInfo = await debugUserStatus()

  if (userRole !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erişim Reddedildi</CardTitle>
            <CardDescription>
              Bu sayfaya erişim için yönetici yetkisi gereklidir. Mevcut rol: {userRole || "Bilinmiyor"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Debug bilgisi:</p>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
              <FixAdminButton />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
        </div>
        <Button asChild>
          <Link href="/users/new">
            <Plus className="mr-2 h-4 w-4" />
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
