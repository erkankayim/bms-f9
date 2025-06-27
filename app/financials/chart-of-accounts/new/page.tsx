"use client"

import AccountForm from "../_components/account-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function NewAccountPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Hesap Oluştur</CardTitle>
          <CardDescription>Hesap planınıza yeni bir mali hesap ekleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountForm />
        </CardContent>
      </Card>
    </div>
  )
}
