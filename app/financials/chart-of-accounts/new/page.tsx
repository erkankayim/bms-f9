"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AccountForm } from "../_components/account-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewAccountPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-4">
        <Link href="/financials/chart-of-accounts">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Hesap Planına Geri Dön
          </Button>
        </Link>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Hesap Ekle</CardTitle>
          <CardDescription>Hesap planına yeni bir hesap eklemek için aşağıdaki bilgileri doldurun.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountForm />
        </CardContent>
      </Card>
    </div>
  )
}
