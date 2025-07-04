import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "../_components/user-form"
import { createUser } from "../_actions/user-actions"
import { requireRole } from "@/lib/auth"

export default async function NewUserPage() {
  // Admin yetkisi kontrolü
  await requireRole("admin")

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yeni Kullanıcı</h1>
        <p className="text-muted-foreground">Sisteme yeni kullanıcı ekleyin</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
          <CardDescription>Yeni kullanıcının bilgilerini girin</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm action={createUser} submitText="Kullanıcı Oluştur" />
        </CardContent>
      </Card>
    </div>
  )
}
