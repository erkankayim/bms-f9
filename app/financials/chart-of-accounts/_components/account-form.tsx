"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { accountSchema, accountTypes, type AccountFormValues } from "../_lib/schema"
import { addAccountAction, updateAccountAction } from "../_actions/server-actions"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { ChartOfAccount } from "./accounts-table-client"

interface Props {
  initialData?: ChartOfAccount | null
  accountId?: number | null
}

export default function AccountForm({ initialData, accountId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [parentOpts, setParentOpts] = useState<ChartOfAccount[]>([])
  const [pending, setPending] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      account_code: initialData?.account_code ?? "",
      account_name: initialData?.account_name ?? "",
      account_type: initialData?.account_type ?? undefined,
      parent_account_id: initialData?.parent_account_id ?? null,
      description: initialData?.description ?? "",
      is_active: initialData?.is_active ?? true,
    },
  })

  /* fetch parent accounts in the browser */
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("chart_of_accounts")
      .select("id, account_code, account_name")
      .eq("is_active", true)
      .order("account_code")
      .then(({ data }) => {
        const filtered = initialData && data ? data.filter((d) => d.id !== initialData.id) : (data ?? [])
        setParentOpts(filtered as ChartOfAccount[])
      })
  }, [initialData])

  async function onSubmit(values: AccountFormValues) {
    setPending(true)
    const res = initialData && accountId ? await updateAccountAction(accountId, values) : await addAccountAction(values)

    setPending(false)
    toast({
      title: res.success ? "Başarılı" : "Hata",
      description: res.success ? (initialData ? "Hesap güncellendi." : "Hesap oluşturuldu.") : (res.message ?? ""),
      variant: res.success ? "default" : "destructive",
    })

    if (res.success) {
      router.push("/financials/chart-of-accounts")
      router.refresh()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* code + name */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="account_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kod *</FormLabel>
                <FormControl>
                  <Input placeholder="100.01" {...field} />
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
                  <Input placeholder="Kasa Hesabı" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* type + parent */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="account_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tür *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accountTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
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
                <FormLabel>Üst Hesap</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                  defaultValue={field.value?.toString() ?? "0"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Yok" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Yok</SelectItem>
                    {parentOpts.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.account_code} – {p.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* active switch */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-4">
              <FormLabel className="text-base">Aktif mi?</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Güncelle" : "Oluştur"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export { AccountForm as default, AccountForm } // default + named
