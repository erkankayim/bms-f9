import { getCurrentUserRole } from "../_actions/users-actions"
import { UserForm } from "../_components/user-form"
import { redirect } from "next/navigation"

export default async function NewUserPage() {
  const userRole = await getCurrentUserRole()

  // Sadece adminler yeni kullanıcı oluşturabilir
  if (userRole !== "admin") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yeni Kullanıcı</h1>
        <p className="text-muted-foreground">Sisteme yeni kullanıcı ekleyin</p>
      </div>

      <UserForm />
    </div>
  )
}
