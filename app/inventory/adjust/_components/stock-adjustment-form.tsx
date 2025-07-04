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
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  adjustStockQuantityAction,
  searchProductsForAdjustment,
  type ProductSearchResult,
} from "../../_actions/inventory-actions"

const stockAdjustmentFormSchema = z.object({
  productId: z.string().min(1, { message: "Ürün seçimi zorunludur." }),
  productName: z.string().optional(),
  quantity: z.coerce
    .number({ invalid_type_error: "Miktar sayı olmalıdır." })
    .refine((val) => val !== 0, { message: "Miktar 0 olamaz." }),
  notes: z.string().optional(),
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

  const [isSearching, startSearchTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const form = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentFormSchema),
    defaultValues: {
      productId: "",
      productName: "",
      quantity: 0,
      notes: "",
    },
  })

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Başarılı!",
        description: state.message || "Stok ayarlaması başarıyla kaydedildi.",
        duration: 1500,
      })
      form.reset({
        productId: "",
        productName: "",
        quantity: 0,
        notes: "",
      })
      setSelectedProduct(null)
      setSearchTerm("")
      setSearchResults([])
    } else if (state?.message && !state.success && state.errors) {
      toast({
        title: "Hata!",
        description: state.message,
        variant: "destructive",
        duration: 1500,
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

  useEffect(() => {
    if (searchTerm.length > 1) {
      startSearchTransition(async () => {
        const result = await searchProductsForAdjustment(searchTerm)
        if (result.success && result.data) {
          setSearchResults(result.data)
        } else {
          setSearchResults([])
          if (result.error) {
            toast({
              title: "Arama Hatası",
              description: result.error,
              variant: "destructive",
              duration: 1500,
            })
          }
        }
      })
    } else {
      if (searchTerm.length <= 1 && searchResults.length > 0) {
        setSearchResults([])
      }
    }
  }, [searchTerm, toast])

  const handleProductSelect = (product: ProductSearchResult) => {
    setSelectedProduct(product)
    form.setValue("productId", product.id)
    form.setValue("productName", `${product.name} (${product.stock_code})`)
    form.clearErrors("productId")
    setPopoverOpen(false)
    setSearchTerm("")
    setSearchResults([])
  }

  const handleFormSubmit = (data: StockAdjustmentFormValues) => {
    const formData = new FormData()
    formData.append("productId", data.productId)
    formData.append("quantity", String(data.quantity))
    if (data.notes) {
      formData.append("notes", data.notes)
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
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
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
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                      disabled={isSearching}
                      className="h-9"
                    />
                    <CommandList>
                      {isSearching && (
                        <div className="p-2 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Aranıyor...</span>
                        </div>
                      )}
                      {!isSearching && searchResults.length === 0 && searchTerm.length > 1 && (
                        <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                      )}
                      <CommandGroup>
                        {searchResults.map((product) => (
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
