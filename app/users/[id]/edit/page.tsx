import { notFound } from "next/navigation"
import { getUser, updateUser, getCurrentUserRole } from "@/app/users/_actions/user-actions"
import { UserForm } from "@/app/users/_components/user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params
  const currentRole = await getCurrentUserRole()

  if (currentRole !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erişim Reddedildi</CardTitle>
            <CardDescription>Bu sayfaya erişim için yönetici yetkisi gereklidir.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const user = await getUser(id)

  if (!user) {
    notFound()
  }

  async function handleUpdateUser(formData: FormData) {
    "use server"
    return await updateUser(id, formData)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/users/${id}`}>
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
          <UserForm user={user} action={handleUpdateUser} submitText="Değişiklikleri Kaydet" />
        </CardContent>
      </Card>
    </div>
  )
}
