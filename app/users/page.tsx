import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Users, AlertCircle } from "lucide-react"
import Link from "next/link"
import { UsersList } from "./_components/users-list"
import { getCurrentUserRole, debugUserStatus } from "./_actions/users-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function UsersPage() {
  // Debug user status
  const debugInfo = await debugUserStatus()
  console.log("Debug info:", debugInfo)

  const userRole = await getCurrentUserRole()
  console.log("Current user role:", userRole)

  if (userRole !== "admin") {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu sayfaya erişim için yönetici yetkisi gereklidir. Mevcut rol: {userRole || "Bilinmiyor"}
            <br />
            Debug bilgisi: {JSON.stringify(debugInfo, null, 2)}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        </div>
        <Button asChild>
          <Link href="/users/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kullanıcı
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Kullanıcılar yükleniyor...</div>
            </CardContent>
          </Card>
        }
      >
        <UsersList />
      </Suspense>
    </div>
  )
}
