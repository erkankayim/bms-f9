"use client"

import { AccountForm } from "../_components/account-form"
import { AuthWrapper } from "../../_components/auth-wrapper"

export default function NewAccountPage() {
  return (
    <AuthWrapper>
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Yeni Hesap Ekle</h1>
          <p className="text-muted-foreground">Mali hesap planınıza yeni bir hesap ekleyin.</p>
        </div>
        <AccountForm />
      </div>
    </AuthWrapper>
  )
}
