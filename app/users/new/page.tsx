import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "../_components/user-form"
import { createUser } from "../_actions/user-actions"
import { requireRole } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function NewUserPage() {
  try {
    // Admin yetkisi kontrolü
    await requireRole(["admin"])
  } catch (error) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Yeni Kullanıcı Ekle</CardTitle>
            <CardDescription>Sisteme yeni bir kullanıcı ekleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm action={createUser} submitText="Kullanıcı Oluştur" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
