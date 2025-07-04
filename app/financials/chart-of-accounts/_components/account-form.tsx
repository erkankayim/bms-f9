"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { accountTypes } from "../_lib/schema"
import { addAccountAction, updateAccountAction } from "../_actions/server-actions"

interface AccountFormProps {
  account?: {
    id: string
    code: string
    name: string
    type: string
    parent_id?: string
    description?: string
    is_active: boolean
  }
  isEdit?: boolean
}

export function AccountForm({ account, isEdit = false }: AccountFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    try {
      if (isEdit && account) {
        await updateAccountAction(account.id, formData)
      } else {
        await addAccountAction(formData)
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Hesap Düzenle" : "Yeni Hesap Ekle"}</CardTitle>
        <CardDescription>
          {isEdit ? "Mevcut hesap bilgilerini güncelleyin" : "Yeni bir hesap oluşturun"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Hesap Kodu *</Label>
              <Input id="code" name="code" defaultValue={account?.code} placeholder="Örn: 100" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Hesap Adı *</Label>
              <Input id="name" name="name" defaultValue={account?.name} placeholder="Örn: Kasa" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Hesap Türü *</Label>
            <Select name="type" defaultValue={account?.type} required>
              <SelectTrigger>
                <SelectValue placeholder="Hesap türünü seçin" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_id">Üst Hesap (Opsiyonel)</Label>
            <Input
              id="parent_id"
              name="parent_id"
              defaultValue={account?.parent_id || ""}
              placeholder="Üst hesap ID'si"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={account?.description || ""}
              placeholder="Hesap açıklaması"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is_active" name="is_active" defaultChecked={account?.is_active ?? true} />
            <Label htmlFor="is_active">Aktif</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Default export for backward compatibility
export default AccountForm
