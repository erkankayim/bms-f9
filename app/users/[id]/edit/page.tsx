import { notFound } from "next/navigation"
import { getUserById, updateUser } from "@/app/users/_actions/user-actions"
import { UserForm } from "@/app/users/_components/user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAdmin } from "@/lib/auth"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  // Admin kontrolü
  await requireAdmin()

  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  // Server Action'ı bind et
  const updateUserWithId = updateUser.bind(null, params.id)

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Düzenle</CardTitle>
          <CardDescription>Kullanıcı bilgilerini güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={user} action={updateUserWithId} />
        </CardContent>
      </Card>
    </div>
  )
}
