import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "../_components/user-form"
import { createUser } from "../_actions/users-actions"

export default function NewUserPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Kullanıcı Oluştur</CardTitle>
          <CardDescription>Sisteme yeni bir kullanıcı ekleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm action={createUser} />
        </CardContent>
      </Card>
    </div>
  )
}
