import { Suspense } from "react"
import { getCurrentUserProfile } from "./_actions/users-actions"
import { UsersList } from "./_components/users-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { redirect } from "next/navigation"

export default async function UsersPage() {
  const currentUser = await getCurrentUserProfile()

  // Only admins can access this page
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
        </div>
        <Button asChild>
          <Link href="/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <UsersList />
      </Suspense>
    </div>
  )
}
