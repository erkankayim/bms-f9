"use client"

import { useState, useTransition, useEffect } from "react"
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
import { CalendarIcon, Loader2, RefreshCw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createExpenseEntry } from "../_actions/expense-actions"
import { getSuppliersForDropdown } from "@/app/financials/_actions/financial-entries-actions"
import { toast } from "sonner"

const expenseFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Tutar gereklidir")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Geçerli bir tutar giriniz",
    }),
  description: z.string().min(1, "Açıklama gereklidir"),
  category: z.string().min(1, "Kategori seçiniz"),
  supplier_id: z.string().optional(),
  date: z.date({
    required_error: "Tarih seçiniz",
  }),
  reference: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>

const expenseCategories = [
  { value: "office_supplies", label: "Ofis Malzemeleri" },
  { value: "utilities", label: "Faturalar" },
  { value: "rent", label: "Kira" },
  { value: "marketing", label: "Pazarlama" },
  { value: "travel", label: "Seyahat" },
  { value: "equipment", label: "Ekipman" },
  { value: "maintenance", label: "Bakım" },
  { value: "insurance", label: "Sigorta" },
  { value: "professional_services", label: "Profesyonel Hizmetler" },
  { value: "other", label: "Diğer" },
]

type Supplier = {
  id: string
  name: string
}

export default function ExpenseForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [suppliersMessage, setSuppliersMessage] = useState("")

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: "",
      description: "",
      category: "office_supplies", // Updated default value to be a non-empty string
      supplier_id: "",
      date: new Date(),
      reference: "",
    },
  })

  const loadSuppliers = async () => {
    setLoadingSuppliers(true)
    setSuppliersMessage("Tedarikçiler yükleniyor...")

    try {
      console.log("Loading suppliers...")
      const result = await getSuppliersForDropdown()
      console.log("Suppliers result:", result)

      if (result.success && result.data) {
        setSuppliers(result.data)
        setSuppliersMessage(`${result.data.length} tedarikçi yüklendi`)
        console.log("Suppliers loaded successfully:", result.data.length)
      } else {
        console.error("Failed to load suppliers:", result.error)
        setSuppliers([])
        setSuppliersMessage(result.error || "Tedarikçiler yüklenemedi")
        toast.error(result.error || "Tedarikçiler yüklenemedi")
      }
    } catch (error) {
      console.error("Error loading suppliers:", error)
      setSuppliers([])
      setSuppliersMessage("Tedarikçiler yüklenirken hata oluştu")
      toast.error("Tedarikçiler yüklenirken hata oluştu")
    } finally {
      setLoadingSuppliers(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  function onSubmit(data: ExpenseFormValues) {
    startTransition(async () => {
      try {
        const result = await createExpenseEntry({
          amount: Number(data.amount),
          description: data.description,
          category: data.category,
          supplier_id: data.supplier_id || null,
          date: data.date.toISOString(),
          reference: data.reference || null,
        })

        if (result.success) {
          toast.success("Gider kaydı başarıyla oluşturuldu")
          router.push("/financials/expenses")
        } else {
          toast.error(result.error || "Gider kaydı oluşturulurken bir hata oluştu")
        }
      } catch (error) {
        console.error("Form submission error:", error)
        toast.error("Beklenmeyen bir hata oluştu")
      }
    })
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Gider Kaydı</CardTitle>
          <CardDescription>Yeni bir gider kaydı oluşturun</CardDescription>
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
                        placeholder="Gider açıklaması..."
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
                        {expenseCategories.map((category) => (
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
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Tedarikçi (Opsiyonel)
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={loadSuppliers}
                        disabled={loadingSuppliers}
                        className="h-6 w-6 p-0"
                      >
                        <RefreshCw className={cn("h-3 w-3", loadingSuppliers && "animate-spin")} />
                      </Button>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending || loadingSuppliers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tedarikçi seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Tedarikçi seçmeyin</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {suppliersMessage && <p className="text-xs text-muted-foreground">{suppliersMessage}</p>}
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
