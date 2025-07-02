import { getCurrentUserRole } from "../_actions/users-actions"
import { UserForm } from "../_components/user-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function NewUserPage() {
  const role = await getCurrentUserRole()

  if (role !== "admin") {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Yetkisiz Erişim</AlertTitle>
          <AlertDescription>
            Bu sayfayı görüntüleme yetkiniz yok. Sadece yöneticiler kullanıcı oluşturabilir.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <UserForm mode="create" />
    </div>
  )
}
