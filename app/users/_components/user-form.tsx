"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { UserWithAuth } from "@/lib/auth"

interface UserFormProps {
  user?: UserWithAuth
  onSubmit: (formData: FormData) => Promise<{ success?: string; error?: string }>
  title: string
  description: string
  submitText: string
}

export function UserForm({ user, onSubmit, title, description, submitText }: UserFormProps) {
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage("")

    const result = await onSubmit(formData)

    if (result.error) {
      setMessage(result.error)
      setIsError(true)
    } else if (result.success) {
      setMessage(result.success)
      setIsError(false)
    }

    setIsLoading(false)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad *</Label>
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
            <Label htmlFor="email">E-posta *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={user?.email}
              placeholder="kullanici@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre {!user && "*"}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={!user}
              placeholder={user ? "Değiştirmek için yeni şifre girin" : "En az 6 karakter"}
              minLength={6}
            />
            {user && <p className="text-sm text-muted-foreground">Şifreyi değiştirmek istemiyorsanız boş bırakın</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Select name="role" defaultValue={user?.role || "tech"} required>
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
            <Label htmlFor="status">Durum *</Label>
            <Select name="status" defaultValue={user?.status || "active"} required>
              <SelectTrigger>
                <SelectValue placeholder="Kullanıcı durumu seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {message && (
            <Alert variant={isError ? "destructive" : "default"}>
              {isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "İşleniyor..." : submitText}
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
