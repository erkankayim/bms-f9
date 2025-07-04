"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import type { UserRole, UserWithAuth } from "@/lib/auth"

interface UserFormProps {
  user?: UserWithAuth
  onSubmit: (formData: FormData) => Promise<{ success?: string; error?: string }>
  submitText: string
  title: string
  description: string
}

export function UserForm({ user, onSubmit, submitText, title, description }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [role, setRole] = useState<UserRole>(user?.role || "tech")
  const [status, setStatus] = useState<"active" | "inactive">(user?.status || "active")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.set("role", role)
    formData.set("status", status)

    try {
      const result = await onSubmit(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success || "İşlem başarılı")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={user?.full_name}
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
              defaultValue={user?.email !== "Bilinmiyor" ? user?.email : ""}
              placeholder="kullanici@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre {user ? "(Değiştirmek için doldurun)" : ""}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={!user}
              placeholder={user ? "Yeni şifre (opsiyonel)" : "Şifre"}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
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
            <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "İşleniyor..." : submitText}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
