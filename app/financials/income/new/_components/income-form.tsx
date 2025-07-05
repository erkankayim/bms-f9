"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createIncomeEntry } from "../_actions/income-actions"
import { toast } from "sonner"

const incomeFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Tutar gereklidir")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Geçerli bir tutar giriniz",
    }),
  description: z.string().min(1, "Açıklama gereklidir"),
  category: z.string().min(1, "Kategori seçiniz"),
  date: z.date({
    required_error: "Tarih seçiniz",
  }),
  reference: z.string().optional(),
})

type IncomeFormValues = z.infer<typeof incomeFormSchema>

const incomeCategories = [
  { value: "sales", label: "Satış Geliri" },
  { value: "service", label: "Hizmet Geliri" },
  { value: "interest", label: "Faiz Geliri" },
  { value: "rental", label: "Kira Geliri" },
  { value: "investment", label: "Yatırım Geliri" },
  { value: "other", label: "Diğer" },
]

export default function IncomeForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      amount: "",
      description: "",
      category: "",
      date: new Date(),
      reference: "",
    },
  })

  function onSubmit(data: IncomeFormValues) {
    startTransition(async () => {
      try {
        const result = await createIncomeEntry({
          amount: Number(data.amount),
          description: data.description,
          category: data.category,
          date: data.date.toISOString(),
          reference: data.reference || null,
        })

        if (result.success) {
          router.push("/financials/income")
        } else {
        }
      } catch (error) {
        console.error("Form submission error:", error)
      }
    })
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Gelir Kaydı</CardTitle>
          <CardDescription>Yeni bir gelir kaydı oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tutar</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" min="0" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Gelir açıklaması..."
                        className="resize-none"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {incomeCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tarih</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            disabled={isPending}
                          >
                            {field.value ? format(field.value, "PPP", { locale: tr }) : <span>Tarih seçiniz</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referans (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Referans numarası veya kodu" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kaydet
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
