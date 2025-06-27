"use client"

import { AccountForm } from "../_components/account-form"

export default function NewAccountPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yeni Hesap Ekle</h1>
        <p className="text-muted-foreground">Hesap planınıza yeni bir hesap ekleyin.</p>
      </div>
      <AccountForm mode="create" />
    </div>
  )
}
