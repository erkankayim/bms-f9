import { getCurrentUserRole, getUserById } from "../../_actions/users-actions"
import { UserForm } from "../../_components/user-form"
import { redirect, notFound } from "next/navigation"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const userRole = await getCurrentUserRole()

  if (userRole !== "admin") {
    redirect("/")
  }

  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <UserForm user={user} mode="edit" />
    </div>
  )
}
