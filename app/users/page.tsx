import { Suspense } from "react"
import { getCurrentUserRole, debugUserStatus, fixAdminProfile } from "./_actions/users-actions"
import { UsersList } from "./_components/users-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

async function DebugInfo() {
  const debugInfo = await debugUserStatus()
  return (
    <div className="mb-4">
      <details className="bg-gray-100 p-4 rounded">
        <summary className="cursor-pointer font-medium">Debug bilgisi</summary>
        <pre className="mt-2 text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
      </details>
    </div>
  )
}

async function FixAdminButton() {
  async function handleFixAdmin() {
    "use server"
    const result = await fixAdminProfile()
    console.log("Fix admin result:", result)
  }

  return (
    <form action={handleFixAdmin}>
      <Button type="submit" variant="outline" className="mb-4 bg-transparent">
        Admin Profilini Düzelt
      </Button>
    </form>
  )
}

export default async function UsersPage() {
  const currentRole = await getCurrentUserRole()

  if (currentRole !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Erişim Reddedildi
            </CardTitle>
            <CardDescription>
              Bu sayfaya erişim için yönetici yetkisi gereklidir. Mevcut rol: {currentRole || "Bilinmiyor"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Yönetici hesabı ile giriş yapmanız gerekmektedir.</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Suspense fallback={<div>Debug bilgisi yükleniyor...</div>}>
                <DebugInfo />
              </Suspense>
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
      </div>

      <Suspense fallback={<div>Kullanıcılar yükleniyor...</div>}>
        <UsersList />
      </Suspense>
    </div>
  )
}
