"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createAccount, updateAccount } from "../_actions/server-actions"
import { type AccountFormData, accountFormSchema } from "../_lib/schema"

interface AccountFormProps {
  initialData?: any
  accountId?: number
}

export default function AccountForm({ initialData, accountId }: AccountFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isEditing = !!accountId && !!initialData

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(null)

    const data: AccountFormData = {
      account_code: formData.get("account_code") as string,
      account_name: formData.get("account_name") as string,
      account_type: formData.get("account_type") as string,
      parent_account_id: formData.get("parent_account_id")
        ? Number.parseInt(formData.get("parent_account_id") as string)
        : undefined,
      description: (formData.get("description") as string) || undefined,
      is_active: formData.get("is_active") === "on",
    }

    // Validate data
    const validation = accountFormSchema.safeParse(data)
    if (!validation.success) {
      setError("Form verilerinde hata var")
      return
    }

    startTransition(async () => {
      try {
        let result
        if (isEditing) {
          result = await updateAccount(accountId, data)
        } else {
          result = await createAccount(data)
        }

        if (result.error) {
          setError(result.error)
        } else {
          setSuccess(isEditing ? "Hesap başarıyla güncellendi" : "Hesap başarıyla oluşturuldu")
          setTimeout(() => {
            router.push("/financials/chart-of-accounts")
          }, 1500)
        }
      } catch (error) {
        setError("Beklenmeyen bir hata oluştu")
      }
    })
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Hesap Düzenle" : "Yeni Hesap Ekle"}</CardTitle>
        <CardDescription>
          {isEditing ? "Mevcut hesap bilgilerini güncelleyin" : "Hesap planına yeni hesap ekleyin"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_code">Hesap Kodu *</Label>
              <Input
                id="account_code"
                name="account_code"
                defaultValue={initialData?.account_code || ""}
                placeholder="Örn: 100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">Hesap Adı *</Label>
              <Input
                id="account_name"
                name="account_name"
                defaultValue={initialData?.account_name || ""}
                placeholder="Örn: Kasa"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">Hesap Türü *</Label>
            <Select name="account_type" defaultValue={initialData?.account_type || ""} required>
              <SelectTrigger>
                <SelectValue placeholder="Hesap türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Varlık</SelectItem>
                <SelectItem value="liability">Yükümlülük</SelectItem>
                <SelectItem value="equity">Özkaynak</SelectItem>
                <SelectItem value="revenue">Gelir</SelectItem>
                <SelectItem value="expense">Gider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_account_id">Ana Hesap (Opsiyonel)</Label>
            <Input
              id="parent_account_id"
              name="parent_account_id"
              type="number"
              defaultValue={initialData?.parent_account_id || ""}
              placeholder="Ana hesap ID'si"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description || ""}
              placeholder="Hesap açıklaması"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is_active" name="is_active" defaultChecked={initialData?.is_active ?? true} />
            <Label htmlFor="is_active">Aktif</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Oluştur"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/financials/chart-of-accounts")}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export { AccountForm }
