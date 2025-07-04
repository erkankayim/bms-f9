import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersList } from "./_components/users-list"
import { getUsers, deleteUser } from "./_actions/user-actions"
import { requireRole } from "@/lib/auth"

export default async function UsersPage() {
  // Admin yetkisi kontrolü
  await requireRole("admin")

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kullanıcılar</h1>
        <p className="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Yükleniyor...</CardTitle>
              <CardDescription>Kullanıcılar yükleniyor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        }
      >
        <UsersListWrapper />
      </Suspense>
    </div>
  )
}

async function UsersListWrapper() {
  try {
    const users = await getUsers()
    return <UsersList users={users} deleteUser={deleteUser} />
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hata</CardTitle>
          <CardDescription>Kullanıcılar yüklenirken bir hata oluştu.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Kullanıcılar getirilemedi"}
          </p>
        </CardContent>
      </Card>
    )
  }
}
