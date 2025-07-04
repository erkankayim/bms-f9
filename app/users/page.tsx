import { getCurrentUserRole } from "@/app/users/_actions/user-actions"
import { UsersList } from "@/app/users/_components/users-list"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function UsersPage() {
  const currentRole = await getCurrentUserRole()

  if (currentRole !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erişim Reddedildi</CardTitle>
            <CardDescription>Bu sayfaya erişim için yönetici yetkisi gereklidir.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
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

      <UsersList />
    </div>
  )
}
