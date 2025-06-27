"use client"

import { useFormState } from "react-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  createOrUpdateIncomeEntryAction,
  type CustomerForDropdown,
  type FinancialCategory,
} from "@/app/financials/_actions/financial-entries-actions"
import { IncomeEntrySchema } from "@/app/financials/_lib/financial-entry-shared"
import type { z } from "zod"

type IncomeFormValues = z.infer<typeof IncomeEntrySchema> & { id?: number }

interface IncomeFormProps {
  customers: CustomerForDropdown[]
  categories: FinancialCategory[]
  initialData?: Partial<IncomeFormValues>
}

export function IncomeForm({ customers, categories, initialData }: IncomeFormProps) {
  const { toast } = useToast()

  const [state, formAction] = useFormState(createOrUpdateIncomeEntryAction, {
    success: false,
    message: "",
  })

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(IncomeEntrySchema),
    defaultValues: {
      id: initialData?.id,
      description: initialData?.description || "",
      incoming_amount: initialData?.incoming_amount || 0,
      entry_date: initialData?.entry_date
        ? format(new Date(initialData.entry_date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      category_id: initialData?.category_id,
      source: initialData?.source || "",
      customer_id: initialData?.customer_id || undefined, // customer_id is MID here
      invoice_number: initialData?.invoice_number || "",
      payment_method: initialData?.payment_method || "",
      notes: initialData?.notes || "",
    },
  })

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Başarılı" : "Hata",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
      if (state.success && !initialData) {
        form.reset()
      }
    }
    if (state.errors) {
      state.errors.forEach((error) => {
        form.setError(error.path[0] as keyof IncomeFormValues, {
          type: "manual",
          message: error.message,
        })
      })
    }
  }, [state, toast, form, initialData])

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Açıklama</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: Proje X danışmanlık geliri" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incoming_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gelen Tutar (₺)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarih</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(new Date(field.value), "PPP") : <span>Tarih seçin</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Gelir kategorisi seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
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
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Müşteri (İsteğe Bağlı)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no-customer">Müşteri Yok</SelectItem>
                    {customers.map((cust) => (
                      <SelectItem key={cust.mid} value={cust.mid}>
                        {cust.contact_name} ({cust.mid})
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
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ödeme Yöntemi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ödeme yöntemi seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["Nakit", "Kredi Kartı", "Banka Transferi", "Çek", "Senet", "Diğer"].map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
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
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kaynak</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: Banka, Elden" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fatura No (İsteğe Bağlı)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notlar (İsteğe Bağlı)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Bu gelir kaydıyla ilgili ek notlar..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Değişiklikleri Kaydet" : "Gelir Kaydı Oluştur"}
        </Button>
      </form>
    </Form>
  )
}
