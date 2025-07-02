import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "../../_components/user-form"
import { getUserById, updateUser } from "../../_actions/users-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const { user, error } = await getUserById(params.id)

  if (error || !user) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error || "Kullanıcı bulunamadı."}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const updateUserWithId = updateUser.bind(null, user.id)

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kullanıcıyı Düzenle</CardTitle>
          <CardDescription>Kullanıcı bilgilerini güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={user} action={updateUserWithId} />
        </CardContent>
      </Card>
    </div>
  )
}
