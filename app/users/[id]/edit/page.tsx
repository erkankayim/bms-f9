import { getUserById, updateUser } from "../../_actions/users-actions"
import { UserForm } from "../../_components/user-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  const updateUserWithId = updateUser.bind(null, params.id)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kullanıcılara Dön
          </Link>
        </Button>
      </div>

      <UserForm
        user={user}
        action={updateUserWithId}
        title="Kullanıcı Düzenle"
        description="Kullanıcı bilgilerini güncelleyin"
        submitText="Güncelle"
      />
    </div>
  )
}
