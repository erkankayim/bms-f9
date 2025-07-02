"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { createUser, updateUser } from "../_actions/users-actions"
import type { UserProfile } from "@/app/lib/types"

interface UserFormProps {
  user?: UserProfile
  mode: "create" | "edit"
}

export function UserForm({ user, mode }: UserFormProps) {
  const [state, formAction, isPending] = useActionState(
    mode === "create" ? createUser : updateUser.bind(null, user?.id || ""),
    { success: false, message: "" },
  )

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Yeni Kullanıcı Ekle" : "Kullanıcı Düzenle"}</CardTitle>
        <CardDescription>
          {mode === "create" ? "Sisteme yeni bir kullanıcı ekleyin." : "Mevcut kullanıcı bilgilerini güncelleyin."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={user?.full_name || ""}
              placeholder="Kullanıcının tam adı"
              required
            />
            {state?.errors?.fullName && <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email || ""}
              placeholder="kullanici@ornek.com"
              required
            />
            {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Şifre{" "}
              {mode === "edit" && (
                <span className="text-muted-foreground">(boş bırakın değiştirmek istemiyorsanız)</span>
              )}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={mode === "create" ? "En az 6 karakter" : "Yeni şifre (opsiyonel)"}
              required={mode === "create"}
            />
            {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
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
            {state?.errors?.role && <p className="text-sm text-destructive">{state.errors.role[0]}</p>}
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
            {state?.errors?.status && <p className="text-sm text-destructive">{state.errors.status[0]}</p>}
          </div>

          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Kullanıcı Oluştur" : "Güncelle"}
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
