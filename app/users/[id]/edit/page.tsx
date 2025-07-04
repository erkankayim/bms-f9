import { getCurrentUserRole, getUserById, updateUser } from "../../_actions/users-actions"
import { UserForm } from "../../_components/user-form"
import { notFound, redirect } from "next/navigation"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const currentRole = await getCurrentUserRole()

  if (currentRole !== "admin") {
    redirect("/users")
  }

  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  const updateUserWithId = updateUser.bind(null, params.id)

  return (
    <div className="container mx-auto py-8">
      <UserForm
        user={user}
        action={updateUserWithId}
        title="Kullanıcı Düzenle"
        description="Kullanıcı bilgilerini güncelleyin"
        submitText="Değişiklikleri Kaydet"
      />
    </div>
  )
}
