"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser, updateUser } from "../_actions/users-actions"
import type { UserWithAuth } from "@/app/lib/types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface UserFormProps {
  user?: UserWithAuth
  mode: "create" | "edit"
}

export function UserForm({ user, mode }: UserFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const [state, formAction, isPending] = useActionState(isEdit && user ? updateUser.bind(null, user.id) : createUser, {
    success: false,
    message: "",
  })

  useEffect(() => {
    if (state.success) {
      router.push("/users")
    }
  }, [state.success, router])

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad *</Label>
            <Input id="fullName" name="fullName" defaultValue={user?.full_name || ""} required disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email || ""}
              required={!isEdit}
              disabled={isPending}
              placeholder={isEdit ? "Değiştirmek için yeni e-posta girin" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre {!isEdit && "*"}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={!isEdit}
              disabled={isPending}
              placeholder={isEdit ? "Değiştirmek için yeni şifre girin" : "En az 6 karakter"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Select name="role" defaultValue={user?.role || "tech"} disabled={isPending}>
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
            <Select name="status" defaultValue={user?.status || "active"} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.message && (
            <div
              className={`p-3 rounded-md text-sm ${
                state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
