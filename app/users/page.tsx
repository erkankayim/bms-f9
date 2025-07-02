import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus } from "lucide-react"
import Link from "next/link"
import { UsersList } from "./_components/users-list"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Sistemde kayıtlı tüm kullanıcıları görüntüleyin, düzenleyin veya silin.
          </p>
        </div>
        <Button asChild>
          <Link href="/users/new">
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
