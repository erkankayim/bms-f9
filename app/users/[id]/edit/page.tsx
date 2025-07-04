import { getUserById } from "../../_actions/users-actions"
import { UserForm } from "../../_components/user-form"
import { notFound } from "next/navigation"

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

  return (
    <div className="container mx-auto py-8">
      <UserForm user={user} mode="edit" />
    </div>
  )
}
