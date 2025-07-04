import { notFound } from "next/navigation"
import { getUser, updateUser } from "@/app/users/_actions/user-actions"
import { UserForm } from "@/app/users/_components/user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params
  const user = await getUser(id)

  if (!user) {
    notFound()
  }

  async function handleUpdateUser(formData: FormData) {
    "use server"
    return await updateUser(id, formData)
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kullanıcı Düzenle</CardTitle>
          <CardDescription>Kullanıcı bilgilerini güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={user} action={handleUpdateUser} />
        </CardContent>
      </Card>
    </div>
  )
}
