"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createUser, updateUser } from "../_actions/users-actions"
import type { UserWithAuth } from "@/app/lib/types"

interface UserFormProps {
  user?: UserWithAuth
  mode: "create" | "edit"
}

export function UserForm({ user, mode }: UserFormProps) {
  const router = useRouter()
  const action = mode === "create" ? createUser : updateUser.bind(null, user?.id || "")
  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
      router.push("/users")
      router.refresh()
    } else if (state?.message && !state?.success) {
      toast.error(state.message)
    }
  }, [state, router])

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Yeni Kullanıcı Oluştur" : "Kullanıcı Düzenle"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad *</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={user?.full_name || ""}
              placeholder="Kullanıcının tam adı"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email || ""}
              placeholder="kullanici@ornek.com"
              required={mode === "create"}
            />
            {mode === "edit" && (
              <p className="text-sm text-muted-foreground">E-posta değiştirmek için yeni e-posta girin</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre {mode === "create" ? "*" : "(değiştirmek için doldurun)"}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={mode === "create" ? "En az 6 karakter" : "Yeni şifre (opsiyonel)"}
              required={mode === "create"}
            />
            {mode === "edit" && (
              <p className="text-sm text-muted-foreground">Şifreyi değiştirmek istemiyorsanız boş bırakın</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select name="role" defaultValue={user?.role || "tech"}>
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Yönetici</SelectItem>
                  <SelectItem value="acc">Muhasebe</SelectItem>
                  <SelectItem value="tech">Teknisyen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Durum *</Label>
              <Select name="status" defaultValue={user?.status || "active"}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {state && !state.success && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Kullanıcı Oluştur" : "Güncelle"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/users")}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
