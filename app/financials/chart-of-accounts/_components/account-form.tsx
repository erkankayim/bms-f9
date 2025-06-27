"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { AccountSchema, type AccountFormData } from "../_lib/schema"
import { addAccountAction, updateAccountAction } from "../_actions/server-actions"

interface AccountFormProps {
  initialData?: Partial<AccountFormData>
  isEditMode?: boolean
  accountId?: string
}

export function AccountForm({ initialData, isEditMode = false, accountId }: AccountFormProps) {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<AccountFormData>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      account_code: initialData?.account_code || "",
      account_name: initialData?.account_name || "",
      account_type: initialData?.account_type || "asset",
      parent_account_id: initialData?.parent_account_id || "",
      description: initialData?.description || "",
      is_active: initialData?.is_active ?? true,
    },
  })

  async function onSubmit(data: AccountFormData) {
    let result
    if (isEditMode && accountId) {
      result = await updateAccountAction(accountId, data)
    } else {
      result = await addAccountAction(data)
    }

    if (result.success) {
      toast({
        title: isEditMode ? "Hesap Güncellendi" : "Hesap Eklendi",
        description: `Hesap ${data.account_name} başarıyla ${isEditMode ? "güncellendi" : "eklendi"}.`,
      })
      router.push("/financials/chart-of-accounts")
    } else {
      toast({
        title: "Hata",
        description: result.error || `Hesap ${isEditMode ? "güncellenemedi" : "eklenemedi"}. Lütfen tekrar deneyin.`,
        variant: "destructive",
      })
    }
  }

  const accountTypes = [
    { value: "asset", label: "Varlık" },
    { value: "liability", label: "Borç" },
    { value: "equity", label: "Özkaynak" },
    { value: "revenue", label: "Gelir" },
    { value: "expense", label: "Gider" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="account_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hesap Kodu *</FormLabel>
                <FormControl>
                  <Input placeholder="örn: 100.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="account_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hesap Adı *</FormLabel>
                <FormControl>
                  <Input placeholder="örn: Kasa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="account_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hesap Türü *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Hesap türü seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parent_account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ana Hesap ID</FormLabel>
                <FormControl>
                  <Input placeholder="Opsiyonel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea placeholder="Hesap hakkında açıklama..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Aktif Hesap</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Bu hesabın işlemlerde kullanılabilir olup olmadığını belirler
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? isEditMode
              ? "Hesap Güncelleniyor..."
              : "Hesap Ekleniyor..."
            : isEditMode
              ? "Değişiklikleri Kaydet"
              : "Hesap Ekle"}
        </Button>
      </form>
    </Form>
  )
}

export default AccountForm
