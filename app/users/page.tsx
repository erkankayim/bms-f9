import { Suspense } from "react"
import { getCurrentUserRole } from "./_actions/users-actions"
import { UsersList } from "./_components/users-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { redirect } from "next/navigation"

export default async function UsersPage() {
  const userRole = await getCurrentUserRole()

  // Sadece adminler bu sayfayı görebilir
  if (userRole !== "admin") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
        </div>
        <Link href="/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Kullanıcılar yükleniyor...</div>}>
        <UsersList />
      </Suspense>
    </div>
  )
}
