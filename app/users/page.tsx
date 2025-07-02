import { Suspense } from "react"
import Link from "next/link"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersList } from "./_components/users-list"

export const dynamic = "force-dynamic"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
        <Button asChild>
          <Link href="/users/new" className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar</CardTitle>
          <CardDescription>Sistemde kayıtlı tüm kullanıcıları görüntüleyin, düzenleyin veya silin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center py-4">Kullanıcılar yükleniyor...</div>}>
            <UsersList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
