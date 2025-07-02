import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { UsersList } from "./_components/users-list"
import { getCurrentUserRole } from "./_actions/users-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function UsersPage() {
  const role = await getCurrentUserRole()

  if (role !== "admin") {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Yetkisiz Erişim</AlertTitle>
          <AlertDescription>Bu sayfayı görüntüleme yetkiniz yok.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
        <Button asChild>
          <Link href="/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar</CardTitle>
          <CardDescription>Sistemdeki tüm kullanıcıları yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Kullanıcılar yükleniyor...</div>}>
            <UsersList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
