import { notFound, redirect } from "next/navigation"

import { getUser, updateUser } from "@/app/users/_actions/user-actions"
import { UserForm } from "@/app/users/_components/user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUserRole } from "@/app/users/_actions/user-actions"

interface EditUserPageProps {
  params: { id: string }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  // Yalnızca admin erişebilsin
  const role = await getCurrentUserRole()
  if (role !== "admin") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Erişim Reddedildi</CardTitle>
            <CardDescription>Bu sayfaya erişim için yönetici yetkisi gereklidir.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Kullanıcı verisini al
  const user = await getUser(params.id)
  if (!user) {
    notFound()
  }

  // Server Action’ı ID ile bind et
  const updateUserWithId = updateUser.bind(null, params.id)

  // Form submit işlemi başarılı olursa detay sayfasına yönlendirme
  async function afterSubmit(_: FormData) {
    "use server"
    redirect(`/users/${params.id}`)
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kullanıcı Düzenle</CardTitle>
          <CardDescription>Kullanıcı bilgilerini güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            user={user}
            action={updateUserWithId} /* Server Action */
            onSuccessAction={afterSubmit}
            submitText="Değişiklikleri Kaydet"
          />
        </CardContent>
      </Card>
    </div>
  )
}
