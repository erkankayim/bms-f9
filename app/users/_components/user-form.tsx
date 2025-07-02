"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createUser, updateUser } from "../_actions/users-actions"
import type { UserProfile } from "@/app/lib/types"

interface UserFormProps {
  user?: UserProfile
  isEdit?: boolean
}

export function UserForm({ user, isEdit = false }: UserFormProps) {
  const action = isEdit && user ? updateUser.bind(null, user.id) : createUser
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Oluştur"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input id="fullName" name="fullName" defaultValue={user?.full_name || ""} required />
              {state?.errors?.fullName && <p className="text-sm text-red-600">{state.errors.fullName[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" defaultValue={user?.email || ""} required />
              {state?.errors?.email && <p className="text-sm text-red-600">{state.errors.email[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre {isEdit && "(Boş bırakırsanız değişmez)"}</Label>
            <Input id="password" name="password" type="password" required={!isEdit} />
            {state?.errors?.password && <p className="text-sm text-red-600">{state.errors.password[0]}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {state?.errors?.role && <p className="text-sm text-red-600">{state.errors.role[0]}</p>}
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
              {state?.errors?.status && <p className="text-sm text-red-600">{state.errors.status[0]}</p>}
            </div>
          </div>

          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEdit ? "Güncelleniyor..." : "Oluşturuluyor...") : isEdit ? "Güncelle" : "Oluştur"}
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
