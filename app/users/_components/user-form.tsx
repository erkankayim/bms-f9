"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type { UserWithAuth } from "@/lib/auth"

interface UserFormProps {
  user?: UserWithAuth
  action: (formData: FormData) => Promise<{ success?: string; error?: string }>
  submitText: string
}

export function UserForm({ user, action, submitText }: UserFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setMessage(null)

    try {
      const result = await action(formData)

      if (result.success) {
        setMessage({ type: "success", text: result.success })
        // Başarılı olursa formu temizle (yeni kullanıcı için)
        if (!user) {
          const form = document.querySelector("form") as HTMLFormElement
          form?.reset()
        }
      } else if (result.error) {
        setMessage({ type: "error", text: result.error })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Bir hata oluştu",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Ad Soyad *</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            defaultValue={user?.full_name}
            required
            disabled={isPending}
            placeholder="Kullanıcının tam adı"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email !== "Bilinmiyor" ? user?.email : ""}
            required
            disabled={isPending}
            placeholder="kullanici@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre {user ? "(Değiştirmek için doldurun)" : "*"}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required={!user}
            disabled={isPending}
            placeholder={user ? "Yeni şifre (opsiyonel)" : "En az 6 karakter"}
            minLength={6}
          />
          {user && <p className="text-sm text-muted-foreground">Şifreyi değiştirmek istemiyorsanız boş bırakın</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol *</Label>
          <Select name="role" defaultValue={user?.role || "tech"} required disabled={isPending}>
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
          <Select name="status" defaultValue={user?.status || "active"} required disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Kullanıcı durumu seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "İşleniyor..." : submitText}
      </Button>
    </form>
  )
}
