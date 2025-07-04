import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersList } from "./_components/users-list"
import { getUsers, deleteUser, getCurrentUserRole } from "./_actions/user-actions"
import { requireRole } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function UsersPage() {
  try {
    // Admin yetkisi kontrolü
    await requireRole(["admin"])
  } catch (error) {
    redirect("/auth/login")
  }

  const users = await getUsers()
  const currentUserRole = await getCurrentUserRole()

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
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
                </div>
              </CardContent>
            </Card>
          }
        >
          <UsersList users={users} deleteUser={deleteUser} />
        </Suspense>
      </div>
    </div>
  )
}
