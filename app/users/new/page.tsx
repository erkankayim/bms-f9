import { getCurrentUserRole, createUser } from "../_actions/user-actions"
import { UserForm } from "../_components/user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function NewUserPage() {
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

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Kullanıcı Ekle</CardTitle>
          <CardDescription>Sisteme yeni bir kullanıcı ekleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm action={createUser} submitText="Kullanıcı Oluştur" />
        </CardContent>
      </Card>
    </div>
  )
}
