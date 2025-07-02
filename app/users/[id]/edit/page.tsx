import { notFound } from "next/navigation"
import { getCurrentUserRole, getUserById } from "../../_actions/users-actions"
import { UserForm } from "../../_components/user-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const role = await getCurrentUserRole()

  if (role !== "admin") {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Yetkisiz Erişim</AlertTitle>
          <AlertDescription>
            Bu sayfayı görüntüleme yetkiniz yok. Sadece yöneticiler kullanıcı düzenleyebilir.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { user, error } = await getUserById(params.id)

  if (error || !user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <UserForm user={user} mode="edit" />
    </div>
  )
}
