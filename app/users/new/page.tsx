import { createUser } from "@/app/users/_actions/user-actions"
import { UserForm } from "@/app/users/_components/user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewUserPage() {
  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Kullanıcı</CardTitle>
          <CardDescription>Sisteme yeni kullanıcı ekleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm action={createUser} />
        </CardContent>
      </Card>
    </div>
  )
}
