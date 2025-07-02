import { getCurrentUserRole, getUserById } from "../../_actions/users-actions"
import { UserForm } from "../../_components/user-form"
import { redirect, notFound } from "next/navigation"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const userRole = await getCurrentUserRole()

  // Sadece adminler kullanıcı düzenleyebilir
  if (userRole !== "admin") {
    redirect("/")
  }

  const { user, error } = await getUserById(params.id)

  if (error || !user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Düzenle</h1>
        <p className="text-muted-foreground">{user.full_name || user.email} kullanıcısını düzenleyin</p>
      </div>

      <UserForm user={user} isEdit />
    </div>
  )
}
