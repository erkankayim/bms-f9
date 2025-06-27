"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AccountSchema, type AccountFormData } from "../_lib/schema"
import { addAccountAction, updateAccountAction } from "../_actions/server-actions"

interface AccountFormProps {
  initialData?: AccountFormData & { id?: string }
  mode?: "create" | "edit"
}

export function AccountForm({ initialData, mode = "create" }: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(AccountSchema),
    defaultValues: initialData || {
      account_code: "",
      account_name: "",
      account_type: "ASSET",
      parent_account_id: "",
      description: "",
      is_active: true,
    },
  })

  const onSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true)
    try {
      if (mode === "edit" && initialData?.id) {
        await updateAccountAction(initialData.id, data)
      } else {
        await addAccountAction(data)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "edit" ? "Hesabı Düzenle" : "Yeni Hesap Ekle"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_code">Hesap Kodu</Label>
              <Input id="account_code" {...register("account_code")} placeholder="Örn: 100" />
              {errors.account_code && <p className="text-sm text-red-600">{errors.account_code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">Hesap Adı</Label>
              <Input id="account_name" {...register("account_name")} placeholder="Örn: Kasa" />
              {errors.account_name && <p className="text-sm text-red-600">{errors.account_name.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">Hesap Türü</Label>
            <Select value={watch("account_type")} onValueChange={(value) => setValue("account_type", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Hesap türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASSET">Varlık</SelectItem>
                <SelectItem value="LIABILITY">Borç</SelectItem>
                <SelectItem value="EQUITY">Özkaynak</SelectItem>
                <SelectItem value="REVENUE">Gelir</SelectItem>
                <SelectItem value="EXPENSE">Gider</SelectItem>
              </SelectContent>
            </Select>
            {errors.account_type && <p className="text-sm text-red-600">{errors.account_type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Hesap açıklaması (isteğe bağlı)"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={watch("is_active")}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
            <Label htmlFor="is_active">Aktif</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : mode === "edit" ? "Güncelle" : "Kaydet"}
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

export default AccountForm
