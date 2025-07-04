import { getCurrentUserProfile } from "../_actions/users-actions"
import { UserForm } from "../_components/user-form"
import { redirect } from "next/navigation"

export default async function NewUserPage() {
  const currentUser = await getCurrentUserProfile()

  // Only admins can create users
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-6">
      <UserForm mode="create" />
    </div>
  )
}
