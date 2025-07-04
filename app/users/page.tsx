import { getCurrentUserRole, getUsers } from "./_actions/user-actions"
import { UsersList } from "./_components/users-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UsersPage() {
  try {
    const [currentUserRole, users] = await Promise.all([getCurrentUserRole(), getUsers()])

    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Kullanıcılar</h1>
          <p className="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
        </div>

        <UsersList users={users} currentUserRole={currentUserRole} />
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Hata</CardTitle>
            <CardDescription>Kullanıcılar yüklenirken bir hata oluştu.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error instanceof Error ? error.message : "Bilinmeyen hata"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
