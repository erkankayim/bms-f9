import { redirect } from "next/navigation"

import { createUser, getCurrentUserRole } from "@/app/users/_actions/user-actions"
import { UserForm } from "@/app/users/_components/user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewUserPage() {
  // Sadece admin kullanıcılar erişsin
  const role = await getCurrentUserRole()
  if (role !== "admin") {
    redirect("/users") // Yönetici değilse listeye yönlendir
  }

  // Kayıt sonrası yönlendirme
  async function afterCreate(_: FormData) {
    "use server"
    redirect("/users")
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Kullanıcı</CardTitle>
          <CardDescription>Sisteme yeni bir kullanıcı ekleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            action={createUser} /* Server Action */
            onSuccessAction={afterCreate}
            submitText="Kullanıcı Oluştur"
          />
        </CardContent>
      </Card>
    </div>
  )
}
