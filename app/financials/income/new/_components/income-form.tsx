"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { getIncomeCategories, getCustomersForSelect } from "../../_actions/financial-entries-actions"
import { createIncome } from "../_actions/income-actions"

type Customer = { mid: string; contact_name: string }
type Category = { id: string; name: string }

const formSchema = z.object({
  incoming_amount: z.coerce.number().positive("Tutar pozitif olmalıdır."),
  entry_date: z.date({ required_error: "Tarih zorunludur." }),
  category: z.string().min(1, "Kategori seçimi zorunludur."),
  customer_mid: z.string().optional().nullable(),
  income_source: z.string().min(1, "Gelir kaynağı açıklaması zorunludur."),
  description: z.string().optional(),
  invoice_number: z.string().optional(),
  payment_method: z.string().min(1, "Ödeme şekli zorunludur."),
  notes: z.string().optional(),
})

export default function IncomeForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_method: "cash",
      entry_date: new Date(),
    },
  })

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const [customersData, categoriesData] = await Promise.all([getCustomersForSelect(), getIncomeCategories()])
      setCustomers(customersData)
      setCategories(categoriesData)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const result = await createIncome(values)
    setIsLoading(false)

    if (result.success) {
      toast({ title: "Başarılı", description: "Gelir kaydı oluşturuldu." })
      router.push("/financials/income")
    } else {
      toast({ title: "Hata", description: result.error, variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Gelir Ekle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input {...form.register("incoming_amount")} placeholder="Gelen Tutar" />
            <Controller
              control={form.control}
              name="entry_date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Tarih Seçin</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
              )}
            />
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gelir Kategorisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              name="payment_method"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ödeme Şekli" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                    <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Input {...form.register("income_source")} placeholder="Gelir Kaynağı (örn: Proje X Ödemesi)" />
          <Textarea {...form.register("description")} placeholder="Detaylı Açıklama (Opsiyonel)" />
          <div className="grid md:grid-cols-2 gap-6">
            <Input {...form.register("invoice_number")} placeholder="Fatura No (Opsiyonel)" />
            <Controller
              control={form.control}
              name="customer_mid"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between bg-transparent">
                      {field.value
                        ? customers.find((c) => c.mid === field.value)?.contact_name
                        : "Müşteri Seçin (Opsiyonel)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Müşteri ara..." />
                      <CommandList>
                        <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((c) => (
                            <CommandItem key={c.mid} value={c.contact_name} onSelect={() => field.onChange(c.mid)}>
                              <Check
                                className={cn("mr-2 h-4 w-4", field.value === c.mid ? "opacity-100" : "opacity-0")}
                              />
                              {c.contact_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          <Textarea {...form.register("notes")} placeholder="Notlar (Opsiyonel)" />
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : "Geliri Ekle"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
