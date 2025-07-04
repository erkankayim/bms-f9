import { getCurrentUserRole, getUser, updateUser } from "../../_actions/user-actions"
import { UserForm } from "../../_components/user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { notFound } from "next/navigation"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const currentUserRole = await getCurrentUserRole()

  if (currentUserRole !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu sayfaya erişim için yönetici yetkisi gereklidir.
            <br />
            Mevcut rol: {currentUserRole || "Bilinmiyor"}
          </AlertDescription>
        </Alert>
      </div>
    )
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
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kullanıcı Düzenle</CardTitle>
          <CardDescription>{user.full_name} kullanıcısının bilgilerini düzenleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={user} action={updateUserWithId} submitText="Değişiklikleri Kaydet" />
        </CardContent>
      </Card>
    </div>
  )
}
