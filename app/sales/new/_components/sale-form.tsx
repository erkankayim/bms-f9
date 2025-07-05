"use client"

import { useState, useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Search, Loader2, Info, X } from "lucide-react"
import { createSaleAction } from "../_actions/sales-actions"
import { Card, CardContent } from "@/components/ui/card"
import { addMonths, format } from "date-fns"

interface Customer {
  mid: string
  contact_name: string | null
}

interface Product {
  stock_code: string
  name: string
  sale_price: number | null
  sale_price_currency: string | null
  vat_rate: number | null
  quantity_on_hand: number | null
}

const saleItemSchema = z.object({
  product_stock_code: z.string().min(1, "Ürün seçimi gereklidir"),
  product_name: z.string().optional(),
  quantity: z.coerce.number().int().positive("Miktar pozitif bir sayı olmalıdır"),
  unit_price: z.coerce.number().positive("Birim fiyat pozitif bir sayı olmalıdır"),
  vat_rate: z.coerce.number().min(0, "KDV oranı negatif olamaz"),
  item_total_gross: z.coerce.number().nonnegative("Toplam tutar negatif olamaz"),
  item_total_net: z.coerce.number().nonnegative("KDV dahil toplam tutar negatif olamaz"),
})

const saleFormSchema = z
  .object({
    customer_mid: z.string().optional().nullable(),
    items: z.array(saleItemSchema).min(1, "En az bir ürün eklemelisiniz"),
    payment_method: z.string().min(1, "Ödeme yöntemi seçimi gereklidir"),
    sale_currency: z.string().length(3, "Para birimi 3 karakter olmalıdır.").default("TRY"),
    is_installment: z.boolean().default(false),
    installment_count: z.coerce
      .number()
      .int()
      .positive("Taksit sayısı pozitif bir sayı olmalıdır.")
      .optional()
      .nullable(),
    discount_amount: z.coerce.number().nonnegative("İndirim tutarı negatif olamaz").default(0),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.is_installment && (!data.installment_count || data.installment_count <= 0)) {
        return false
      }
      if (data.is_installment && data.payment_method === "cash") {
        return false
      }
      return true
    },
    {
      message: "Taksitli ödeme seçiliyse, geçerli bir taksit sayısı girilmeli ve ödeme yöntemi nakit olmamalıdır.",
      path: ["installment_count"],
    },
  )

type SaleFormValues = z.infer<typeof saleFormSchema>

const CURRENCIES = ["TRY", "USD", "EUR"]

export function SaleForm() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customer_mid: null,
      items: [],
      payment_method: "",
      sale_currency: "TRY",
      is_installment: false,
      installment_count: null,
      discount_amount: 0,
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const paymentMethod = useWatch({ control: form.control, name: "payment_method" })
  const isInstallment = useWatch({ control: form.control, name: "is_installment" })
  const installmentCount = useWatch({ control: form.control, name: "installment_count" })
  const saleCurrency = useWatch({ control: form.control, name: "sale_currency" })

  useEffect(() => {
    async function fetchCustomers() {
      setLoadingCustomers(true)
      const { data, error } = await supabase
        .from("customers")
        .select("mid, contact_name")
        .is("deleted_at", null)
        .order("contact_name")
      if (error) {
        toast.error("Müşteriler yüklenemedi", { description: error.message })
      } else {
        setCustomers(data || [])
      }
      setLoadingCustomers(false)
    }
    fetchCustomers()
  }, [supabase])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        (productSearchTerm && productSearchTerm.length > 1 && !selectedProduct) ||
        (showProductDropdown && !productSearchTerm && !selectedProduct)
      ) {
        searchProducts()
      }
    }, 300)
    return () => clearTimeout(timer)

    async function searchProducts() {
      setLoadingProducts(true)
      setShowProductDropdown(true)

      let query = supabase
        .from("products")
        .select("stock_code, name, sale_price, sale_price_currency, vat_rate, quantity_on_hand")
        .is("deleted_at", null)
        .order("name")
        .limit(10)

      // If there's a search term, filter by name, otherwise just get first 10 products
      if (productSearchTerm && productSearchTerm.trim()) {
        query = query.ilike("name", `%${productSearchTerm}%`)
      }

      const { data, error } = await query

      if (error) {
        toast.error("Ürünler aranamadı", { description: error.message })
        setProducts([])
      } else {
        setProducts(data || [])
      }
      setLoadingProducts(false)
    }
  }, [productSearchTerm, selectedProduct, supabase, showProductDropdown])

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setProductSearchTerm(product.name)
    setProducts([])
    setShowProductDropdown(false)
  }

  const clearProductSearch = () => {
    setSelectedProduct(null)
    setProductSearchTerm("")
    setProducts([])
    setShowProductDropdown(false)
  }

  const handleAddProduct = () => {
    if (!selectedProduct) return

    const unitPrice = selectedProduct.sale_price || 0
    const vatRate = selectedProduct.vat_rate || 0
    const quantity = 1
    const itemTotalGross = unitPrice * quantity
    const itemTotalNet = itemTotalGross * (1 + vatRate)

    append({
      product_stock_code: selectedProduct.stock_code,
      product_name: selectedProduct.name,
      quantity,
      unit_price: unitPrice,
      vat_rate: vatRate,
      item_total_gross: itemTotalGross,
      item_total_net: itemTotalNet,
    })

    if (fields.length === 0 && selectedProduct.sale_price_currency) {
      if (CURRENCIES.includes(selectedProduct.sale_price_currency)) {
        form.setValue("sale_currency", selectedProduct.sale_price_currency)
      }
    }

    clearProductSearch()
  }

  const handleInputFocus = () => {
    setShowProductDropdown(true)
  }

  const handleInputBlur = () => {
    setTimeout(() => setShowProductDropdown(false), 200)
  }

  const updateItemTotal = (index: number) => {
    const item = form.getValues(`items.${index}`)
    const itemTotalGross = item.quantity * item.unit_price
    const itemTotalNet = itemTotalGross * (1 + item.vat_rate)
    form.setValue(`items.${index}.item_total_gross`, itemTotalGross)
    form.setValue(`items.${index}.item_total_net`, itemTotalNet)
    form.trigger("items")
  }

  const { totalGross, totalTax, finalAmount } = useMemo(() => {
    const items = form.getValues("items")
    const discountAmount = form.getValues("discount_amount") || 0
    const totalNet = items.reduce((sum, item) => sum + (item.item_total_net || 0), 0)
    const totalGross = items.reduce((sum, item) => sum + (item.item_total_gross || 0), 0)
    const totalTax = totalNet - totalGross
    const finalAmount = totalNet - discountAmount
    return { totalGross, totalTax, totalNet, discountAmount, finalAmount }
  }, [form.watch("items"), form.watch("discount_amount")])

  const installmentDetails = useMemo(() => {
    if (isInstallment && installmentCount && installmentCount > 0 && finalAmount > 0) {
      const monthlyAmount = finalAmount / installmentCount
      const firstDueDate = addMonths(new Date(), 1)
      return {
        monthlyAmount: monthlyAmount.toFixed(2),
        firstDueDate: format(firstDueDate, "dd.MM.yyyy"),
      }
    }
    return null
  }, [isInstallment, installmentCount, finalAmount])

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: saleCurrency }).format(amount)
    } catch (e) {
      return `${amount.toFixed(2)} ${saleCurrency}`
    }
  }

  async function onSubmit(data: SaleFormValues) {
    const saleDataForAction = {
      ...data,
      total_amount: totalGross,
      tax_amount: totalTax,
      final_amount: finalAmount,
      installment_count: data.is_installment ? data.installment_count : null,
    }

    const result = await createSaleAction(saleDataForAction)

    if (result.success) {
      toast.success("Satış Oluşturuldu", {
        description: `Satış #${result.data?.id} başarıyla oluşturuldu.`,
      })
      router.push(`/sales/${result.data?.id}`)
    } else {
      toast.error("Hata", {
        description: result.error || "Satış oluşturulamadı. Lütfen tekrar deneyin.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Müşteri Bilgileri</h3>
          <FormField
            control={form.control}
            name="customer_mid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Müşteri</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin (opsiyonel)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingCustomers ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Yükleniyor...</span>
                      </div>
                    ) : (
                      customers.map((customer) => (
                        <SelectItem key={customer.mid} value={customer.mid}>
                          {customer.contact_name || customer.mid}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>Misafir satışı için boş bırakabilirsiniz.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Ürünler</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ürün ara..."
                className="pl-8 pr-8"
                value={productSearchTerm}
                onChange={(e) => {
                  setProductSearchTerm(e.target.value)
                  if (selectedProduct) setSelectedProduct(null)
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              {productSearchTerm && (
                <button
                  type="button"
                  onClick={clearProductSearch}
                  className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {loadingProducts && (
                <div className="absolute right-8 top-2.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {showProductDropdown && products.length > 0 && (
                <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto shadow-lg">
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {products.map((product) => (
                        <li
                          key={product.stock_code}
                          className="p-3 hover:bg-muted cursor-pointer transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleProductSelect(product)
                          }}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>Stok: {product.quantity_on_hand || 0}</span>
                            <span>
                              {product.sale_price?.toFixed(2) || "0.00"} {product.sale_price_currency || ""}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
            <Button type="button" onClick={handleAddProduct} disabled={!selectedProduct}>
              <Plus className="mr-1 h-4 w-4" /> Ürün Ekle
            </Button>
          </div>

          {fields.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Ürün</th>
                    <th className="p-2 text-right">Miktar</th>
                    <th className="p-2 text-right">Birim Fiyat ({saleCurrency})</th>
                    <th className="p-2 text-right">KDV</th>
                    <th className="p-2 text-right">Toplam</th>
                    <th className="p-2 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-t">
                      <td className="p-2">{form.getValues(`items.${index}.product_name`)}</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="1"
                          className="w-20 text-right"
                          {...form.register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                            onChange: () => updateItemTotal(index),
                          })}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-24 text-right"
                          {...form.register(`items.${index}.unit_price`, {
                            valueAsNumber: true,
                            onChange: () => updateItemTotal(index),
                          })}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          className="w-20 text-right"
                          {...form.register(`items.${index}.vat_rate`, {
                            valueAsNumber: true,
                            onChange: () => updateItemTotal(index),
                          })}
                        />
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(form.getValues(`items.${index}.item_total_net`))}
                      </td>
                      <td className="p-2 text-center">
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">Henüz ürün eklenmedi.</p>
            </div>
          )}
          {form.formState.errors.items?.root && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.items.root.message}</p>
          )}
        </div>

        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Ödeme Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ödeme Yöntemi</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      if (value === "cash") form.setValue("is_installment", false)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seçin..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Nakit</SelectItem>
                      <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                      <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sale_currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para Birimi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seçin..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
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
              name="discount_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İndirim Tutarı ({saleCurrency})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {paymentMethod !== "cash" && (
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="is_installment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Taksitli Ödeme</FormLabel>
                      <FormDescription>Bu satış için ödeme planı oluşturulsun mu?</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {isInstallment && (
                <FormField
                  control={form.control}
                  name="installment_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taksit Sayısı</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          placeholder="Örn: 3, 6, 12"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {installmentDetails && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                  <Info className="inline-block h-4 w-4 mr-1" />
                  Yaklaşık aylık taksit: <strong>{formatCurrency(Number(installmentDetails.monthlyAmount))}</strong>.
                  İlk taksit tarihi: <strong>{installmentDetails.firstDueDate}</strong>.
                </div>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notlar</FormLabel>
                <FormControl>
                  <Textarea placeholder="Satışla ilgili ek notlar..." className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-6 border-t pt-4 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ara Toplam:</span>
              <span>{formatCurrency(totalGross)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">KDV:</span>
              <span>{formatCurrency(totalTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">İndirim:</span>
              <span>-{formatCurrency(form.getValues("discount_amount"))}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-lg">
              <span>Genel Toplam:</span>
              <span>{formatCurrency(finalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || fields.length === 0}
            className="w-full md:w-auto"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Satış Oluşturuluyor...
              </>
            ) : (
              "Satışı Tamamla"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
