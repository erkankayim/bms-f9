"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { UserWithAuth } from "@/app/lib/types"

interface UserFormProps {
  user?: UserWithAuth
  action: (prevState: any, formData: FormData) => Promise<{ success: boolean; message: string }>
  title: string
  description: string
  submitText: string
}

export function UserForm({ user, action, title, description, submitText }: UserFormProps) {
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {user && <input type="hidden" name="id" value={user.id} />}

          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              defaultValue={user?.full_name}
              placeholder="Kullanıcının tam adı"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required={!user}
              defaultValue={user?.email}
              placeholder="kullanici@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre {user && "(Değiştirmek için doldurun)"}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={!user}
              placeholder="En az 6 karakter"
              minLength={6}
            />
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

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitText}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
