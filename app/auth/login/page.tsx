"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginAction } from "../actions"
import Link from "next/link"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  // Giriş başarılı olduğunda client-side yönlendirme
  useEffect(() => {
    if (state?.success) {
      window.location.href = "/"
    }
  }, [state?.success])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription>Hesabınıza giriş yapmak için bilgilerinizi girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" placeholder="ornek@email.com" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" name="password" type="password" required disabled={isPending} />
            </div>
            {state?.message && !state?.success && (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            {state?.success && (
              <Alert>
                <AlertDescription className="text-green-600">{state.message} Yönlendiriliyor...</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Hesabınız yok mu?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Kayıt ol
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
