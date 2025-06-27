"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AccountSchema, accountTypes, type AccountFormData } from "../_lib/schema"
import { addAccountAction, updateAccountAction } from "../_actions/server-actions"
import type { Account } from "../_actions/server-actions"

interface AccountFormProps {
  initialData?: Account
}

export function AccountForm({ initialData }: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      type: (initialData?.type as any) || "asset",
      parent_id: initialData?.parent_id || null,
      is_active: initialData?.is_active ?? true,
    },
  })

  const onSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true)
    try {
      if (initialData) {
        await updateAccountAction(initialData.id, data)
      } else {
        await addAccountAction(data)
      }
    } catch (error) {
      console.error("Form gönderilirken hata:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code">Hesap Kodu</Label>
        <Input id="code" {...register("code")} placeholder="Örn: 100.01" />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Hesap Adı</Label>
        <Input id="name" {...register("name")} placeholder="Örn: Kasa" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Hesap Türü</Label>
        <Select value={watch("type")} onValueChange={(value) => setValue("type", value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Hesap türü seçin" />
          </SelectTrigger>
          <SelectContent>
            {accountTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
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
          {isSubmitting ? "Kaydediliyor..." : initialData ? "Güncelle" : "Kaydet"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          İptal
        </Button>
      </div>
    </form>
  )
}

export default AccountForm
