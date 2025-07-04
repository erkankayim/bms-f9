import { getCurrentUserRole, createUser } from "@/app/users/_actions/user-actions"
import { UserForm } from "@/app/users/_components/user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function NewUserPage() {
  const currentRole = await getCurrentUserRole()

  if (currentRole !== "admin") {
    redirect("/users")
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
          <h1 className="text-3xl font-bold">Yeni Kullanıcı Ekle</h1>
          <p className="text-muted-foreground">Sisteme yeni bir kullanıcı ekleyin</p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
          <CardDescription>Yeni kullanıcının bilgilerini girin. Tüm zorunlu alanları doldurun.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm action={createUser} submitText="Kullanıcı Oluştur" />
        </CardContent>
      </Card>
    </div>
  )
}
