"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginAction } from "../actions"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await loginAction(null, formData)

        if (result.success) {
          toast({
            title: "Başarılı",
            description: "Giriş başarılı! Yönlendiriliyorsunuz...",
            variant: "default",
          })
          // AuthProvider otomatik olarak yönlendirecek
        } else {
          toast({
            title: "Hata",
            description: result.message || "Giriş başarısız",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Hata",
          description: "Beklenmeyen bir hata oluştu",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/mny-makine-logo.svg"
              alt="MNY Makine"
              width={208}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription>MNY Makine İş Yönetim Sistemine giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" required disabled={isPending} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" name="password" type="password" required disabled={isPending} />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
