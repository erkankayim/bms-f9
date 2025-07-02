import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "../_components/user-form"
import { getCurrentUserRole } from "../_actions/users-actions"
import { redirect } from "next/navigation"

export default async function NewUserPage() {
  const currentUserRole = await getCurrentUserRole()

  // Sadece admin kullanıcılar yeni kullanıcı oluşturabilir
  if (currentUserRole !== "admin") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Yeni Kullanıcı</h1>
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
          <CardDescription>Yeni kullanıcı oluşturun.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm currentUserRole={currentUserRole} />
        </CardContent>
      </Card>
    </div>
  )
}
