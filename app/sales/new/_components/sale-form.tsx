"use client"

import { useState, useEffect, useTransition } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createSaleAction, searchCustomers, searchProducts } from "../_actions/sales-actions"
import { useActionState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const saleItemSchema = z.object({
  product_stock_code: z.string().min(1, "Ürün seçimi zorunludur"),
  product_name: z.string().min(1, "Ürün adı gereklidir"),
  quantity: z.number().min(1, "Miktar en az 1 olmalıdır"),
  unit_price: z.number().min(0, "Birim fiyat 0 veya daha büyük olmalıdır"),
  total_price: z.number().min(0, "Toplam fiyat 0 veya daha büyük olmalıdır"),
})

const saleFormSchema = z.object({
  customer_mid: z.string().min(1, "Müşteri seçimi zorunludur"),
  customer_name: z.string().optional(),
  sale_date: z.string().min(1, "Satış tarihi zorunludur"),
  payment_method: z.enum(["cash", "credit_card", "bank_transfer", "check", "installment"], {
    required_error: "Ödeme yöntemi seçimi zorunludur",
  }),
  currency: z.enum(["TRY", "USD", "EUR"], {
    required_error: "Para birimi seçimi zorunludur",
  }),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "En az bir ürün eklemelisiniz"),
})

type SaleFormData = z.infer<typeof saleFormSchema>

type Customer = {
  mid: string
  contact_name: string
  email: string | null
}

type Product = {
  stock_code: string
  name: string
  price: number
  quantity_on_hand: number
}

const initialState = {
  success: false,
  message: "",
  errors: {},
}

export default function SaleForm() {
  const { toast } = useToast()
  const [state, formAction, isPending] = useActionState(createSaleAction, initialState)

  // Customer search states
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false)
  const [isSearchingCustomers, startCustomerSearchTransition] = useTransition()

  // Product search states for each item
  const [productSearchTerms, setProductSearchTerms] = useState<{ [key: number]: string }>({})
  const [productResults, setProductResults] = useState<{ [key: number]: Product[] }>({})
  const [productPopoverStates, setProductPopoverStates] = useState<{ [key: number]: boolean }>({})
  const [isSearchingProducts, startProductSearchTransition] = useTransition()

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customer_mid: "",
      customer_name: "",
      sale_date: new Date().toISOString().split("T")[0],
      payment_method: "cash",
      currency: "TRY",
      notes: "",
      items: [
        {
          product_stock_code: "",
          product_name: "",
          quantity: 1,
          unit_price: 0,
          total_price: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // Customer search effect
  useEffect(() => {
    if (customerSearchTerm.length > 1) {
      startCustomerSearchTransition(async () => {
        try {
          const result = await searchCustomers(customerSearchTerm)
          if (result.success && result.data) {
            setCustomers(result.data)
          } else {
            setCustomers([])
            if (result.error) {
              toast({
                title: "Arama Hatası",
                description: result.error,
                variant: "destructive",
              })
            }
          }
        } catch (error) {
          console.error("Customer search error:", error)
          setCustomers([])
        }
      })
    } else {
      setCustomers([])
    }
  }, [customerSearchTerm, toast])

  // Product search effect
  const searchProductsForItem = (itemIndex: number, searchTerm: string) => {
    if (searchTerm.length > 0) {
      startProductSearchTransition(async () => {
        try {
          const result = await searchProducts(searchTerm)
          if (result.success && result.data) {
            setProductResults((prev) => ({
              ...prev,
              [itemIndex]: result.data || [],
            }))
          } else {
            setProductResults((prev) => ({
              ...prev,
              [itemIndex]: [],
            }))
            if (result.error) {
              toast({
                title: "Ürün Arama Hatası",
                description: result.error,
                variant: "destructive",
              })
            }
          }
        } catch (error) {
          console.error("Product search error:", error)
          setProductResults((prev) => ({
            ...prev,
            [itemIndex]: [],
          }))
        }
      })
    } else {
      // Show initial products when no search term
      startProductSearchTransition(async () => {
        try {
          const result = await searchProducts("")
          if (result.success && result.data) {
            setProductResults((prev) => ({
              ...prev,
              [itemIndex]: result.data || [],
            }))
          }
        } catch (error) {
          console.error("Product search error:", error)
        }
      })
    }
  }

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Başarılı!",
        description: state.message || "Satış başarıyla kaydedildi.",
      })
      form.reset()
      setSelectedCustomer(null)
      setCustomers([])
      setCustomerSearchTerm("")
      setProductResults({})
      setProductSearchTerms({})
    } else if (state.message && !state.success) {
      toast({
        title: "Hata!",
        description: state.message,
        variant: "destructive",
      })
    }
  }, [state, toast, form])

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    form.setValue("customer_mid", customer.mid)
    form.setValue("customer_name", customer.contact_name)
    form.clearErrors("customer_mid")
    setCustomerPopoverOpen(false)
    setCustomerSearchTerm("")
  }

  const handleProductSelect = (itemIndex: number, product: Product) => {
    form.setValue(`items.${itemIndex}.product_stock_code`, product.stock_code)
    form.setValue(`items.${itemIndex}.product_name`, product.name)
    form.setValue(`items.${itemIndex}.unit_price`, product.price)

    const quantity = form.getValues(`items.${itemIndex}.quantity`) || 1
    form.setValue(`items.${itemIndex}.total_price`, quantity * product.price)

    form.clearErrors(`items.${itemIndex}.product_stock_code`)

    setProductPopoverStates((prev) => ({
      ...prev,
      [itemIndex]: false,
    }))

    setProductSearchTerms((prev) => ({
      ...prev,
      [itemIndex]: "",
    }))
  }

  const updateTotalPrice = (itemIndex: number) => {
    const quantity = form.getValues(`items.${itemIndex}.quantity`) || 0
    const unitPrice = form.getValues(`items.${itemIndex}.unit_price`) || 0
    const totalPrice = quantity * unitPrice
    form.setValue(`items.${itemIndex}.total_price`, totalPrice)
  }

  const calculateGrandTotal = () => {
    const items = form.getValues("items")
    return items.reduce((total, item) => total + (item.total_price || 0), 0)
  }

  const onSubmit = (data: SaleFormData) => {
    const formData = new FormData()

    formData.append("customer_mid", data.customer_mid)
    formData.append("sale_date", data.sale_date)
    formData.append("payment_method", data.payment_method)
    formData.append("currency", data.currency)
    if (data.notes) {
      formData.append("notes", data.notes)
    }

    // Add items as JSON
    formData.append("items", JSON.stringify(data.items))

    formAction(formData)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Satış</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Müşteri *</Label>
                <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerPopoverOpen}
                      className={cn("w-full justify-between", !selectedCustomer && "text-muted-foreground")}
                    >
                      {selectedCustomer ? selectedCustomer.contact_name : "Müşteri seçin..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Müşteri ara..."
                        value={customerSearchTerm}
                        onValueChange={setCustomerSearchTerm}
                        disabled={isSearchingCustomers}
                      />
                      <CommandList>
                        {isSearchingCustomers && (
                          <div className="p-2 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Aranıyor...</span>
                          </div>
                        )}
                        {!isSearchingCustomers && customers.length === 0 && customerSearchTerm.length > 1 && (
                          <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
                        )}
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.mid}
                              value={customer.contact_name}
                              onSelect={() => handleCustomerSelect(customer)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCustomer?.mid === customer.mid ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{customer.contact_name}</span>
                                <span className="text-sm text-muted-foreground">{customer.mid}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {form.formState.errors.customer_mid && (
                  <p className="text-sm text-red-500">{form.formState.errors.customer_mid.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_date">Satış Tarihi *</Label>
                <Input id="sale_date" type="date" {...form.register("sale_date")} />
                {form.formState.errors.sale_date && (
                  <p className="text-sm text-red-500">{form.formState.errors.sale_date.message}</p>
                )}
              </div>
            </div>

            {/* Payment Method and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Ödeme Yöntemi *</Label>
                <Select
                  value={form.watch("payment_method")}
                  onValueChange={(value) => form.setValue("payment_method", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ödeme yöntemi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                    <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                    <SelectItem value="check">Çek</SelectItem>
                    <SelectItem value="installment">Taksit</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.payment_method && (
                  <p className="text-sm text-red-500">{form.formState.errors.payment_method.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi *</Label>
                <Select
                  value={form.watch("currency")}
                  onValueChange={(value) => form.setValue("currency", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Para birimi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">TRY (Türk Lirası)</SelectItem>
                    <SelectItem value="USD">USD (Amerikan Doları)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.currency && (
                  <p className="text-sm text-red-500">{form.formState.errors.currency.message}</p>
                )}
              </div>
            </div>

            {/* Sale Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Satış Kalemleri</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      product_stock_code: "",
                      product_name: "",
                      quantity: 1,
                      unit_price: 0,
                      total_price: 0,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ürün Ekle
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {/* Product Selection */}
                    <div className="md:col-span-2 space-y-2">
                      <Label>Ürün *</Label>
                      <Popover
                        open={productPopoverStates[index] || false}
                        onOpenChange={(open) => {
                          setProductPopoverStates((prev) => ({
                            ...prev,
                            [index]: open,
                          }))
                          if (open) {
                            // Load initial products when opening
                            searchProductsForItem(index, "")
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !form.watch(`items.${index}.product_name`) && "text-muted-foreground",
                            )}
                          >
                            {form.watch(`items.${index}.product_name`) || "Ürün seçin..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Ürün ara..."
                              value={productSearchTerms[index] || ""}
                              onValueChange={(value) => {
                                setProductSearchTerms((prev) => ({
                                  ...prev,
                                  [index]: value,
                                }))
                                searchProductsForItem(index, value)
                              }}
                              disabled={isSearchingProducts}
                            />
                            <CommandList>
                              {isSearchingProducts && (
                                <div className="p-2 flex items-center justify-center">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="ml-2">Aranıyor...</span>
                                </div>
                              )}
                              {!isSearchingProducts &&
                                (!productResults[index] || productResults[index].length === 0) && (
                                  <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                                )}
                              <CommandGroup>
                                {(productResults[index] || []).map((product) => (
                                  <CommandItem
                                    key={product.stock_code}
                                    value={product.name}
                                    onSelect={() => handleProductSelect(index, product)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        form.watch(`items.${index}.product_stock_code`) === product.stock_code
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{product.name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {product.stock_code} - Stok: {product.quantity_on_hand} - Fiyat: {product.price}{" "}
                                        ₺
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {form.formState.errors.items?.[index]?.product_stock_code && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.items[index]?.product_stock_code?.message}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label>Miktar *</Label>
                      <Input
                        type="number"
                        min="1"
                        {...form.register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                          onChange: () => updateTotalPrice(index),
                        })}
                      />
                      {form.formState.errors.items?.[index]?.quantity && (
                        <p className="text-sm text-red-500">{form.formState.errors.items[index]?.quantity?.message}</p>
                      )}
                    </div>

                    {/* Unit Price */}
                    <div className="space-y-2">
                      <Label>Birim Fiyat *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`items.${index}.unit_price`, {
                          valueAsNumber: true,
                          onChange: () => updateTotalPrice(index),
                        })}
                      />
                      {form.formState.errors.items?.[index]?.unit_price && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.items[index]?.unit_price?.message}
                        </p>
                      )}
                    </div>

                    {/* Total Price */}
                    <div className="space-y-2">
                      <Label>Toplam</Label>
                      <Input
                        type="number"
                        step="0.01"
                        readOnly
                        value={form.watch(`items.${index}.total_price`) || 0}
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Remove Button */}
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Grand Total */}
            <div className="flex justify-end">
              <div className="text-right">
                <Label className="text-lg font-semibold">
                  Genel Toplam: {calculateGrandTotal().toFixed(2)} {form.watch("currency")}
                </Label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea id="notes" placeholder="Satış ile ilgili notlar..." {...form.register("notes")} />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Temizle
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Satışı Kaydet"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
