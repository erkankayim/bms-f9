import { UserForm } from "../_components/user-form"

export default function NewUserPage() {
  return (
    <div className="container mx-auto py-8">
      <UserForm mode="create" />
    </div>
  )
}
