import { getCurrentUserRole, getUser, updateUser } from "@/app/users/_actions/user-actions"
import { UserForm } from "@/app/users/_components/user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"

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

  const user = await getUser(params.id)

  if (!user) {
    notFound()
  }

  const updateUserWithId = async (formData: FormData) => {
    "use server"
    return await updateUser(params.id, formData)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Düzenle</h1>
          <p className="text-muted-foreground">{user.full_name} kullanıcısını düzenleyin</p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
          <CardDescription>
            Kullanıcı bilgilerini güncelleyin. Şifreyi değiştirmek istemiyorsanız boş bırakın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={user} action={updateUserWithId} submitText="Kullanıcıyı Güncelle" />
        </CardContent>
      </Card>
    </div>
  )
}
