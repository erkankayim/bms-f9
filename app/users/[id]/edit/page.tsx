import { notFound } from "next/navigation"
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
  // Admin yetkisi kontrolü
  await requireRole("admin")

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Düzenle</h1>
        <p className="text-muted-foreground">{user.full_name} kullanıcısını düzenleyin</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
          <CardDescription>Kullanıcı bilgilerini güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={user} action={updateUserWithId} submitText="Kullanıcıyı Güncelle" />
        </CardContent>
      </Card>
    </div>
  )
}
