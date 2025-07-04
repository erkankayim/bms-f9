"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createUser, updateUser } from "../_actions/users-actions"
import type { UserWithAuth } from "@/app/lib/types"

interface UserFormProps {
  user?: UserWithAuth
  mode: "create" | "edit"
}

export function UserForm({ user, mode }: UserFormProps) {
  const [state, formAction, isPending] = useActionState(mode === "create" ? createUser : updateUser, null)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Yeni Kullanıcı Oluştur" : "Kullanıcı Düzenle"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {mode === "edit" && user && <input type="hidden" name="id" value={user.id} />}

          <div className="space-y-2">
            <Label htmlFor="full_name">Ad Soyad</Label>
            <Input id="full_name" name="full_name" defaultValue={user?.full_name || ""} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" name="email" type="email" defaultValue={user?.email || ""} required={mode === "create"} />
            {mode === "edit" && (
              <p className="text-sm text-muted-foreground">E-posta değiştirmek için yeni e-posta adresini girin</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" name="password" type="password" required={mode === "create"} />
            {mode === "edit" && (
              <p className="text-sm text-muted-foreground">
                Şifreyi değiştirmek için yeni şifre girin, değiştirmek istemiyorsanız boş bırakın
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
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
            <Label htmlFor="status">Durum</Label>
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

          {state && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Kaydediliyor..." : mode === "create" ? "Oluştur" : "Güncelle"}
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
