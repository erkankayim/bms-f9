"use client"

import { getCurrentUserRole, createUser } from "../_actions/user-actions"
import { UserForm } from "../_components/user-form"
import { redirect } from "next/navigation"

export default async function NewUserPage() {
  const currentRole = await getCurrentUserRole()

  if (currentRole !== "admin") {
    redirect("/users")
  }

  return (
    <div className="container mx-auto py-8">
      <UserForm
        onSubmit={createUser}
        title="Yeni Kullanıcı Ekle"
        description="Sisteme yeni bir kullanıcı ekleyin"
        submitText="Kullanıcı Oluştur"
      />
    </div>
  )
}
