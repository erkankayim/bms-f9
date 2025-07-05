"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useActionState, useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  adjustStockQuantityAction,
  searchProductsForAdjustment,
  searchSuppliersForAdjustment,
  type ProductSearchResult,
  type SupplierSearchResult,
} from "../../_actions/inventory-actions"

const stockAdjustmentFormSchema = z.object({
  productId: z.string().min(1, { message: "Ürün seçimi zorunludur." }),
  productName: z.string().optional(),
  quantity: z.coerce
    .number({ invalid_type_error: "Miktar sayı olmalıdır." })
    .refine((val) => val !== 0, { message: "Miktar 0 olamaz." }),
  notes: z.string().optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
})

type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentFormSchema>

const initialState = {
  message: "",
  errors: null as Record<string, string[] | undefined> | null | undefined,
  success: false,
}

export function StockAdjustmentForm() {
  const { toast } = useToast()
  const [state, formAction, isPending] = useActionState(adjustStockQuantityAction, initialState)

  // Product search states
  const [isSearchingProducts, startProductSearchTransition] = useTransition()
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [productSearchResults, setProductSearchResults] = useState<ProductSearchResult[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null)
  const [productPopoverOpen, setProductPopoverOpen] = useState(false)

  // Supplier search states
  const [isSearchingSuppliers, startSupplierSearchTransition] = useTransition()
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("")
  const [supplierSearchResults, setSupplierSearchResults] = useState<SupplierSearchResult[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierSearchResult | null>(null)
  const [supplierPopoverOpen, setSupplierPopoverOpen] = useState(false)

  const form = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentFormSchema),
    defaultValues: {
      productId: "",
      productName: "",
      quantity: 0,
      notes: "",
      supplierId: "",
      supplierName: "",
    },
  })

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Başarılı!",
        description: state.message || "Stok ayarlaması başarıyla kaydedildi.",
      })
      form.reset({
        productId: "",
        productName: "",
        quantity: 0,
        notes: "",
        supplierId: "",
        supplierName: "",
      })
      setSelectedProduct(null)
      setSelectedSupplier(null)
      setProductSearchTerm("")
      setSupplierSearchTerm("")
      setProductSearchResults([])
      setSupplierSearchResults([])
    } else if (state?.message && !state.success && state.errors) {
      toast({
        title: "Hata!",
        description: state.message,
        variant: "destructive",
      })
    }
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, value]) => {
        if (value && value.length > 0) {
          form.setError(key as keyof StockAdjustmentFormValues, { type: "manual", message: value.join(", ") })
        }
      })
    }
  }, [state, toast, form])

  // Product search effect
  useEffect(() => {
    if (productSearchTerm.length > 1) {
      startProductSearchTransition(async () => {
        const result = await searchProductsForAdjustment(productSearchTerm)
        if (result.success && result.data) {
          setProductSearchResults(result.data)
        } else {
          setProductSearchResults([])
          if (result.error) {
            toast({ title: "Arama Hatası", description: result.error, variant: "destructive" })
          }
        }
      })
    } else {
      if (productSearchTerm.length <= 1 && productSearchResults.length > 0) {
        setProductSearchResults([])
      }
    }
  }, [productSearchTerm, toast])

  // Supplier search effect
  useEffect(() => {
    if (supplierSearchTerm.length > 1) {
      startSupplierSearchTransition(async () => {
        const result = await searchSuppliersForAdjustment(supplierSearchTerm)
        if (result.success && result.data) {
          setSupplierSearchResults(result.data)
        } else {
          setSupplierSearchResults([])
          if (result.error) {
            toast({ title: "Tedarikçi Arama Hatası", description: result.error, variant: "destructive" })
          }
        }
      })
    } else {
      if (supplierSearchTerm.length <= 1 && supplierSearchResults.length > 0) {
        setSupplierSearchResults([])
      }
    }
  }, [supplierSearchTerm, toast])

  const handleProductSelect = (product: ProductSearchResult) => {
    setSelectedProduct(product)
    form.setValue("productId", product.id)
    form.setValue("productName", `${product.name} (${product.stock_code})`)
    form.clearErrors("productId")
    setProductPopoverOpen(false)
    setProductSearchTerm("")
    setProductSearchResults([])
  }

  const handleSupplierSelect = (supplier: SupplierSearchResult) => {
    setSelectedSupplier(supplier)
    form.setValue("supplierId", supplier.id)
    form.setValue("supplierName", `${supplier.name}${supplier.supplier_code ? ` (${supplier.supplier_code})` : ""}`)
    form.clearErrors("supplierId")
    setSupplierPopoverOpen(false)
    setSupplierSearchTerm("")
    setSupplierSearchResults([])
  }

  const handleSupplierClear = () => {
    setSelectedSupplier(null)
    form.setValue("supplierId", "")
    form.setValue("supplierName", "")
    form.clearErrors("supplierId")
  }

  const handleFormSubmit = (data: StockAdjustmentFormValues) => {
    const formData = new FormData()
    formData.append("productId", data.productId)
    formData.append("quantity", String(data.quantity))
    if (data.notes) {
      formData.append("notes", data.notes)
    }
    if (data.supplierId) {
      formData.append("supplierId", data.supplierId)
    }
    formAction(formData)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 p-6 border rounded-lg shadow-sm bg-card text-card-foreground"
      >
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ürün Seçin</FormLabel>
              <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={productPopoverOpen}
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {selectedProduct
                        ? `${selectedProduct.name} (${selectedProduct.stock_code}) - Mevcut Stok: ${selectedProduct.current_stock}`
                        : "Ürün seçin veya arayın..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Ürün adı veya stok kodu ile ara..."
                      value={productSearchTerm}
                      onValueChange={setProductSearchTerm}
                      disabled={isSearchingProducts}
                      className="h-9"
                    />
                    <CommandList>
                      {isSearchingProducts && (
                        <div className="p-2 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Aranıyor...</span>
                        </div>
                      )}
                      {!isSearchingProducts && productSearchResults.length === 0 && productSearchTerm.length > 1 && (
                        <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                      )}
                      <CommandGroup>
                        {productSearchResults.map((product) => (
                          <CommandItem
                            value={`${product.name} ${product.stock_code} ${product.id}`}
                            key={product.id}
                            onSelect={() => handleProductSelect(product)}
                          >
                            {product.name} ({product.stock_code})
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedProduct?.id === product.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Değişim Miktarı</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Örn: 10 veya -5" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Stok artışı için pozitif (örn: 10), azalışı için negatif (örn: -5) bir değer girin.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tedarikçi (Opsiyonel)</FormLabel>
              <Popover open={supplierPopoverOpen} onOpenChange={setSupplierPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <div className="relative">
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={supplierPopoverOpen}
                        className={cn("w-full justify-between pr-10", !field.value && "text-muted-foreground")}
                      >
                        {selectedSupplier
                          ? `${selectedSupplier.name}${selectedSupplier.supplier_code ? ` (${selectedSupplier.supplier_code})` : ""}`
                          : "Tedarikçi seçin veya arayın..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                      {selectedSupplier && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={handleSupplierClear}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Tedarikçi adı veya kodu ile ara..."
                      value={supplierSearchTerm}
                      onValueChange={setSupplierSearchTerm}
                      disabled={isSearchingSuppliers}
                      className="h-9"
                    />
                    <CommandList>
                      {isSearchingSuppliers && (
                        <div className="p-2 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Aranıyor...</span>
                        </div>
                      )}
                      {!isSearchingSuppliers && supplierSearchResults.length === 0 && supplierSearchTerm.length > 1 && (
                        <CommandEmpty>Tedarikçi bulunamadı.</CommandEmpty>
                      )}
                      <CommandGroup>
                        {supplierSearchResults.map((supplier) => (
                          <CommandItem
                            value={`${supplier.name} ${supplier.supplier_code} ${supplier.id}`}
                            key={supplier.id}
                            onSelect={() => handleSupplierSelect(supplier)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{supplier.name}</span>
                              {supplier.supplier_code && (
                                <span className="text-sm text-muted-foreground">Kod: {supplier.supplier_code}</span>
                              )}
                              {supplier.contact_name && (
                                <span className="text-sm text-muted-foreground">İletişim: {supplier.contact_name}</span>
                              )}
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedSupplier?.id === supplier.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Bu stok ayarlaması ile ilişkili tedarikçiyi seçebilirsiniz (isteğe bağlı).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar (Opsiyonel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ayarlama nedeni (örn: Yıl sonu sayım farkı)"
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Stok Ayarlamasını Kaydet"
          )}
        </Button>
      </form>
    </Form>
  )
}
