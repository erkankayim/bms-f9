"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { AccountSchema, accountTypes, type AccountFormData } from "../_lib/schema"
import { addAccountAction, updateAccountAction } from "../_actions/server-actions"

interface AccountFormProps {
  initialData?: {
    id?: string
    code: string
    name: string
    type: string
    parent_id?: string | null
    description?: string | null
  }
  parentAccounts?: Array<{
    id: string
    code: string
    name: string
  }>
}

export function AccountForm({ initialData, parentAccounts = [] }: AccountFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!initialData?.id

  const form = useForm<AccountFormData>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      type: (initialData?.type as any) || "Varlık",
      parent_id: initialData?.parent_id || null,
      description: initialData?.description || "",
    },
  })

  const onSubmit = async (data: AccountFormData) => {
    startTransition(async () => {
      try {
        if (isEditing && initialData?.id) {
          await updateAccountAction(initialData.id, data)
          toast({
            title: "Başarılı",
            description: "Hesap başarıyla güncellendi.",
          })
        } else {
          await addAccountAction(data)
          toast({
            title: "Başarılı",
            description: "Hesap başarıyla eklendi.",
          })
        }
      } catch (error) {
        toast({
          title: "Hata",
          description: error instanceof Error ? error.message : "Bir hata oluştu.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Hesabı Düzenle" : "Yeni Hesap Ekle"}</CardTitle>
        <CardDescription>
          {isEditing ? "Hesap bilgilerini güncelleyin." : "Yeni bir mali hesap oluşturun."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hesap Kodu *</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: 100, 120.01" {...field} className="font-mono" />
                    </FormControl>
                    <FormDescription>Benzersiz hesap kodu (harf, rakam, nokta, tire)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hesap Türü *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Hesap türünü seçin" />
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
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hesap Adı *</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Kasa, Banka, Ticari Alacaklar" {...field} />
                  </FormControl>
                  <FormDescription>Hesabın açıklayıcı adı</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {parentAccounts.length > 0 && (
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Üst Hesap (Opsiyonel)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Üst hesap seçin (opsiyonel)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={null}>Üst hesap yok</SelectItem>
                        {parentAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Bu hesabın bağlı olacağı üst hesap</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Hesap hakkında ek bilgiler..." className="resize-none" rows={3} {...field} />
                  </FormControl>
                  <FormDescription>Hesap hakkında ek açıklamalar</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending
                  ? isEditing
                    ? "Güncelleniyor..."
                    : "Ekleniyor..."
                  : isEditing
                    ? "Hesabı Güncelle"
                    : "Hesabı Ekle"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <a href="/financials/chart-of-accounts">İptal</a>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default AccountForm
