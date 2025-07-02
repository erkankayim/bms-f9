import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "../../_components/user-form"
import { getUserById, getCurrentUserRole } from "../../_actions/users-actions"
import { notFound, redirect } from "next/navigation"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const currentUserRole = await getCurrentUserRole()

  // Sadece admin kullanıcılar diğer kullanıcıları düzenleyebilir
  if (currentUserRole !== "admin") {
    redirect("/")
  }

  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Kullanıcı Düzenle</h1>
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
          <CardDescription>Kullanıcı bilgilerini güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={user} currentUserRole={currentUserRole} />
        </CardContent>
      </Card>
    </div>
  )
}
