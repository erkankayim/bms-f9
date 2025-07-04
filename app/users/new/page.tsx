import { createUser } from "../_actions/users-actions"
import { UserForm } from "../_components/user-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewUserPage() {
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
        action={createUser}
        title="Yeni Kullanıcı Oluştur"
        description="Sisteme yeni bir kullanıcı ekleyin"
        submitText="Kullanıcı Oluştur"
      />
    </div>
  )
}
