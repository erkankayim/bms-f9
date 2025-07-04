"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser, updateUser } from "../_actions/users-actions"
import type { UserWithAuth } from "@/app/lib/types"

interface UserFormProps {
  user?: UserWithAuth
  mode: "create" | "edit"
}

export function UserForm({ user, mode }: UserFormProps) {
  const action = mode === "create" ? createUser : updateUser.bind(null, user?.id || "")
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
            <Input
              id="fullName"
              name="fullName"
              defaultValue={user?.full_name || ""}
              required
              placeholder="Kullanıcının tam adı"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={mode === "edit" ? "" : ""}
              required={mode === "create"}
              placeholder="kullanici@example.com"
            />
            {mode === "edit" && (
              <p className="text-sm text-muted-foreground">E-posta değiştirmek için yeni e-posta adresini girin</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={mode === "create"}
              placeholder={mode === "create" ? "En az 6 karakter" : "Değiştirmek için yeni şifre girin"}
            />
            {mode === "edit" && (
              <p className="text-sm text-muted-foreground">Şifreyi değiştirmek istemiyorsanız boş bırakın</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select name="role" defaultValue={user?.role || "tech"}>
              <SelectTrigger>
                <SelectValue placeholder="Kullanıcı rolü seçin" />
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
            <Select name="status" defaultValue={user?.status || "active"}>
              <SelectTrigger>
                <SelectValue placeholder="Kullanıcı durumu seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state && (
            <div
              className={`p-3 rounded-md text-sm ${
                state.success
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {state.message}
            </div>
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
