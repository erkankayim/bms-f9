import { getCurrentUserRole } from "../_actions/users-actions"
import { UserForm } from "../_components/user-form"
import { redirect } from "next/navigation"

export default async function NewUserPage() {
  const userRole = await getCurrentUserRole()

  if (userRole !== "admin") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-8">
      <UserForm mode="create" />
    </div>
  )
}
