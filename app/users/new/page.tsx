import { getCurrentUserRole } from "../_actions/users-actions"
import { createUser } from "../_actions/users-actions"
import { UserForm } from "../_components/user-form"
import { redirect } from "next/navigation"

export default async function NewUserPage() {
  const currentRole = await getCurrentUserRole()

  if (currentRole !== "admin") {
    redirect("/users")
  }

  return (
    <div className="container mx-auto py-8">
      <UserForm
        action={createUser}
        title="Yeni Kullanıcı Ekle"
        description="Sisteme yeni bir kullanıcı ekleyin"
        submitText="Kullanıcı Oluştur"
      />
    </div>
  )
}
