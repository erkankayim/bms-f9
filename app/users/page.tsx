import { Suspense } from "react"
import { getCurrentUserRole, getUsers, deleteUser } from "./_actions/user-actions"
import { UsersList } from "./_components/users-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

async function UsersContent() {
  try {
    const [currentUserRole, users] = await Promise.all([getCurrentUserRole(), getUsers()])

    if (currentUserRole !== "admin") {
      return (
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bu sayfaya erişim için yönetici yetkisi gereklidir.
              <br />
              Mevcut rol: {currentUserRole || "Bilinmiyor"}
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return <UsersList users={users} onDelete={deleteUser} />
  } catch (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kullanıcılar yüklenirken bir hata oluştu.
            <br />
            {error instanceof Error ? error.message : "Bilinmeyen hata"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }
}

export default function UsersPage() {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <UsersContent />
      </Suspense>
    </div>
  )
}
