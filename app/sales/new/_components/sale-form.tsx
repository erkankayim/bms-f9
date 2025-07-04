"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { getProductsForSale, getCustomersForSale, createSaleAction } from "../_actions/sales-actions"

type Product = Awaited<ReturnType<typeof getProductsForSale>>[0]
type Customer = Awaited<ReturnType<typeof getCustomersForSale>>[0]
\
const saleItemSchema = z.object(\{
  product_stock_code: z.string().min(1, "Ürün seçimi zorunludur."),
  quantity: z.coerce.number().positive("Miktar pozitif olmalıdır."),
  unit_price: z.coerce.number().nonnegative("Birim fiyat negatif olamaz."),
  vat_rate: z.coerce.number().min(0).max(100),
  discount_rate: z.coerce.number().min(0).max(100),
\})
\
const formSchema = z.object(\{\
  customer_mid: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1, "En az bir ürün eklenmelidir."),
  payment_method: z.string().min(1, "Ödeme yöntemi zorunludur."),
  is_installment: z.boolean(),
  installment_count: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
\})
\
export function SaleForm()
\
{
  const router = useRouter()\
  const \{ toast \} = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>(\{\
    resolver: zodResolver(formSchema),
    defaultValues: \{\
      customer_mid: null,
      items: [],
      payment_method: "cash",
      is_installment: false,
      installment_count: 2,
      notes: "",
    \},\
  \})\
\
  const \{ fields, append, remove \} = useFieldArray(\{\
    control: form.control,
    name: "items",
  \})
\
  const watchedItems = form.watch("items")
  const isInstallment = form.watch("is_installment")

  useEffect(() => \{\
    async function fetchData() \{\
      setIsLoading(true)\
      const [productsData, customersData] = await Promise.all([getProductsForSale(), getCustomersForSale()])\
      setProducts(productsData)\
      setCustomers(customersData)\
      setIsLoading(false)\
    \}\
    fetchData()
  \}, [])
\
  const addNewProduct = () => \\
    append(\
      product_stock_code: "",
      quantity: 1,\
      unit_price: 0,
      vat_rate: 0,
      discount_rate: 0,
    \)
  \
\
  const onProductSelect = (index: number, stock_code: string) => \{\
    const product = products.find((p) => p.stock_code === stock_code)
    if (product) \
      form.setValue(`items.$\{index\}.product_stock_code`, product.stock_code)
      form.setValue(`items.$\{index\}.unit_price`, product.sale_price)
      form.setValue(`items.$\{index\}.vat_rate`, product.vat_rate)
    \
  \}

  const totals = useMemo(() => \{\
    return watchedItems.reduce(
      (acc, item) => \{\
        const item_gross_total = (item.unit_price || 0) * (item.quantity || 0)\
        const item_discount = item_gross_total * ((item.discount_rate || 0) / 100)\
        const item_after_discount = item_gross_total - item_discount\
        const item_tax = item_after_discount * ((item.vat_rate || 0) / 100)
        
        acc.subTotal += item_gross_total
        acc.discountTotal += item_discount
        acc.taxTotal += item_tax
        acc.finalTotal += item_after_discount + item_tax
        return acc
      \},
      \{ subTotal: 0, discountTotal: 0, taxTotal: 0, finalTotal: 0 \},
    )
  \}, [watchedItems])

  async function onSubmit(values: z.infer<typeof formSchema>) \{
    setIsLoading(true)
    const result = await createSaleAction(values)
    setIsLoading(false)

    if (result.success) \
      toast(\{ title: "Başarılı", description: "Satış başarıyla oluşturuldu." \})
      router.push("/sales")
    \else \
      toast(\{ title: "Hata", description: result.error, variant: "destructive" \})
    \
  \}

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Satış Oluştur</CardTitle>
        <CardDescription>Müşteri, ürün ve ödeme bilgilerini girerek yeni bir satış kaydı oluşturun.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit=\{form.handleSubmit(onSubmit)\} className="space-y-8">
          \{/* Müşteri ve Ödeme */\}
          <div className="grid md:grid-cols-2 gap-6">
            <Controller
              control=\{form.control\}
              name="customer_mid"
              render=\{(\{ field \}) => (
                <div className="space-y-2">
                  <Label>Müşteri (Opsiyonel)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between bg-transparent">
                        \{field.value ? customers.find((c) => c.mid === field.value)?.contact_name : "Müşteri Seçin"\}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Müşteri ara..." />
                        <CommandList>
                          <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
                          <CommandGroup>
                            \{customers.map((customer) => (
                              <CommandItem
                                key=\{customer.mid\}
                                value=\{customer.contact_name\}
                                onSelect=\{() => field.onChange(customer.mid)\}
                              >
                                <Check className=\{cn("mr-2 h-4 w-4", field.value === customer.mid ? "opacity-100" : "opacity-0")\} />
                                \{customer.contact_name\}
                              </CommandItem>
                            ))\}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )\}
            />
            <Controller
              control=\{form.control\}
              name="payment_method"
              render=\{(\{ field \}) => (
                <div className="space-y-2">
                  <Label>Ödeme Yöntemi</Label>
                  <Select onValueChange=\{field.onChange\} defaultValue=\{field.value\}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Nakit</SelectItem>
                      <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                      <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                      <SelectItem value="check">Çek</SelectItem>
                      <SelectItem value="promissory_note">Senet</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )\}
            />
          </div>

          \{/* Ürünler */\}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Satış Kalemleri</Label>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Ürün</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead>Birim Fiyat</TableHead>
                    <TableHead>KDV (%)</TableHead>
                    <TableHead>İskonto (%)</TableHead>
                    <TableHead>Toplam</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  \{fields.map((field, index) => (
                    <TableRow key=\{field.id\}>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between text-xs h-8 bg-transparent">
                              \{watchedItems[index]?.product_stock_code ? products.find(p => p.stock_code === watchedItems[index].product_stock_code)?.name : "Ürün Seç"\}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Ürün ara..." />
                              <CommandList>
                                <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                                <CommandGroup>
                                  \{products.map((product) => (
                                    <CommandItem key=\{product.stock_code\} value=\{product.name\} onSelect=\{() => onProductSelect(index, product.stock_code)\}>
                                      \{product.name\}
                                    </CommandItem>
                                  ))\}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell><Input type="number" \{...form.register(`items.$\{index\}.quantity`)\} className="h-8" /></TableCell>
                      <TableCell><Input type="number" step="0.01" \{...form.register(`items.$\{index\}.unit_price`)\} className="h-8" /></TableCell>
                      <TableCell><Input type="number" \{...form.register(`items.$\{index\}.vat_rate`)\} className="h-8" /></TableCell>
                      <TableCell><Input type="number" \{...form.register(`items.$\{index\}.discount_rate`)\} className="h-8" /></TableCell>
                      <TableCell>
                        \{((watchedItems[index]?.unit_price || 0) * (watchedItems[index]?.quantity || 0) * (1 - (watchedItems[index]?.discount_rate || 0)/100) * (1 + (watchedItems[index]?.vat_rate || 0)/100)).toFixed(2)\}
                      </TableCell>
                      <TableCell><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick=\{() => remove(index)\}><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))\}
                </TableBody>
              </Table>
            </div>
            <Button type="button" variant="outline" size="sm" onClick=\{addNewProduct\}><PlusCircle className="mr-2 h-4 w-4" />Ürün Ekle</Button>
          </div>

          \{/* Taksit ve Notlar */\}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Controller control=\{form.control\} name="is_installment" render=\{(\{ field \}) => <Switch checked=\{field.value\} onCheckedChange=\{field.onChange\} />\} />
                    <Label>Taksitli Ödeme</Label>
                </div>
                \{isInstallment && (
                    <Controller control=\{form.control\} name="installment_count" render=\{(\{ field \}) => <Input type="number" placeholder="Taksit Sayısı" \{...field\} value=\{field.value ?? 2\} />\} />
                )\}
            </div>
            <Controller control=\{form.control\} name="notes" render=\{(\{ field \}) => <Textarea placeholder="Satış ile ilgili notlar..." \{...field\} />\} />
          </div>

          \{/* Toplamlar */\}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between"><span>Ara Toplam</span><span>\{totals.subTotal.toFixed(2)\} ₺</span></div>
                <div className="flex justify-between"><span>İndirim</span><span className="text-destructive">-\{totals.discountTotal.toFixed(2)\} ₺</span></div>
                <div className="flex justify-between"><span>KDV</span><span>\{totals.taxTotal.toFixed(2)\} ₺</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Genel Toplam</span><span>\{totals.finalTotal.toFixed(2)\} ₺</span></div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick=\{() => router.push('/sales')\}>İptal</Button>
            <Button type="submit" disabled=\{isLoading\}>
              \{isLoading ? "Kaydediliyor..." : "Satışı Oluştur"\}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
\}
