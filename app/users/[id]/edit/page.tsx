import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "../../_components/user-form"
import { getUser, updateUser } from "../../_actions/user-actions"
import { requireRole } from "@/lib/auth"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  try {
    // Admin yetkisi kontrolü
    await requireRole(["admin"])
  } catch (error) {
    redirect("/auth/login")
  }

  const user = await getUser(params.id)

  if (!user) {
    notFound()
  }

  const updateUserWithId = async (formData: FormData) => {
    "use server"
    return updateUser(params.id, formData)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Düzenle</CardTitle>
            <CardDescription>{user.full_name} kullanıcısının bilgilerini düzenleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm user={user} action={updateUserWithId} submitText="Değişiklikleri Kaydet" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
