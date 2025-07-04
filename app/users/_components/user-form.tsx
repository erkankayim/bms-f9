"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createUser, updateUser } from "../_actions/users-actions"
import type { UserWithAuth } from "@/app/lib/types"

interface UserFormProps {
  user?: UserWithAuth
  mode: "create" | "edit"
}

export function UserForm({ user, mode }: UserFormProps) {
  const action = mode === "create" ? createUser : updateUser.bind(null, user!.id)
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Yeni Kullanıcı" : "Kullanıcı Düzenle"}</CardTitle>
        <CardDescription>
          {mode === "create" ? "Sisteme yeni kullanıcı ekleyin" : "Kullanıcı bilgilerini güncelleyin"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input id="fullName" name="fullName" defaultValue={user?.full_name} required disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email}
              required={mode === "create"}
              disabled={isPending}
              placeholder={mode === "edit" ? "Değiştirmek için yeni e-posta girin" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={mode === "create"}
              disabled={isPending}
              placeholder={mode === "edit" ? "Değiştirmek için yeni şifre girin" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
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
            <Label htmlFor="status">Durum</Label>
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

          {state && !state.success && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {state && state.success && (
            <Alert>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Kaydediliyor..." : mode === "create" ? "Kullanıcı Oluştur" : "Güncelle"}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
