import { getCurrentUserRole, getUserById, updateUser } from "../../_actions/user-actions"
import { UserForm } from "../../_components/user-form"
import { notFound, redirect } from "next/navigation"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  // Yetki kontrolü (sadece admin)
  const currentRole = await getCurrentUserRole()
  if (currentRole !== "admin") {
    redirect("/users")
  }

  // Kullanıcıyı getir
  const user = await getUserById(params.id)
  if (!user) {
    notFound()
  }

  // Server Action'ı ID ile bağla
  const updateUserWithId = updateUser.bind(null, params.id)

  return (
    <div className="container mx-auto py-8">
      <UserForm
        user={user}
        action={updateUserWithId} // ✅ Server Action prop
        title="Kullanıcı Düzenle"
        description="Kullanıcı bilgilerini güncelleyin"
        submitText="Değişiklikleri Kaydet"
      />
    </div>
  )
}
