"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { UserProfile } from "@/app/lib/types"

interface UserFormProps {
  user?: UserProfile
  action: (prevState: any, formData: FormData) => Promise<{ success: boolean; message: string; errors?: any }>
}

export function UserForm({ user, action }: UserFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false, message: "" })
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      router.push("/users")
    } else if (state.message && !state.success) {
      toast.error(state.message)
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Ad Soyad</Label>
        <Input id="fullName" name="fullName" defaultValue={user?.full_name || ""} required />
        {state.errors?.fullName && <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" name="email" type="email" defaultValue={user?.email || ""} required />
        {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{user ? "Yeni Şifre (değiştirmek için doldurun)" : "Şifre"}</Label>
        <Input id="password" name="password" type="password" />
        {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.push("/users")} disabled={isPending}>
          İptal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : user ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  )
}
