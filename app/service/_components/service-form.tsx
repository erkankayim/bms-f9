"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Search, Loader2, X } from "lucide-react"
import { createServiceRequest, updateServiceRequest } from "../_actions/service-actions"

// Müşteri tipi
interface Customer {
  mid: string
  contact_name: string | null
  phone: string | null
  email: string | null
}

// Ürün tipi
interface Product {
  stock_code: string
  name: string
  sale_price: number | null
}

// Servis formu şeması
const serviceFormSchema = z.object({
  customer_mid: z.string().optional().nullable(),
  customer_name: z.string().min(1, "Müşteri adı gereklidir"),
  customer_phone: z.string().optional(),
  customer_email: z.string().email("Geçerli bir e-posta adresi girin").optional().or(z.literal("")),
  product_stock_code: z.string().optional().nullable(),
  product_name: z.string().min(1, "Ürün adı gereklidir"),
  fault_description: z.string().min(1, "Arıza açıklaması gereklidir"),
  service_notes: z.string().optional(),
  status: z.string().min(1, "Durum seçimi gereklidir"),
  priority: z.string().min(1, "Öncelik seçimi gereklidir"),
  estimated_cost: z.coerce.number().nonnegative("Tahmini maliyet negatif olamaz").optional(),
  actual_cost: z.coerce.number().nonnegative("Gerçek maliyet negatif olamaz").optional(),
  technician_name: z.string().optional(),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

interface ServiceFormProps {
  initialData?: any
}

export function ServiceForm({ initialData }: ServiceFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  // Form tanımı
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      customer_mid: initialData?.customer_mid || null,
      customer_name: initialData?.customer_name || "",
      customer_phone: initialData?.customer_phone || "",
      customer_email: initialData?.customer_email || "",
      product_stock_code: initialData?.product_stock_code || null,
      product_name: initialData?.product_name || "",
      fault_description: initialData?.fault_description || "",
      service_notes: initialData?.service_notes || "",
      status: initialData?.service_status || "pending",
      priority: initialData?.priority || "normal",
      estimated_cost: initialData?.estimated_cost || 0,
      actual_cost: initialData?.actual_cost || 0,
      technician_name: initialData?.technician_name || "",
    },
  })

  // Input focus/blur handlers
  const handleCustomerInputFocus = () => {
    // Eğer arama terimi varsa veya daha önce arama yapılmışsa dropdown'ı göster
    if (customerSearchTerm || customers.length > 0) {
      setShowCustomerDropdown(true)
    } else {
      // Arama terimi yoksa boş bir arama yap ki dropdown açılsın
      setCustomerSearchTerm(" ")
      setTimeout(() => setCustomerSearchTerm(""), 100)
    }
  }

  const handleProductInputFocus = () => {
    // Eğer arama terimi varsa veya daha önce arama yapılmışsa dropdown'ı göster
    if (productSearchTerm || products.length > 0) {
      setShowProductDropdown(true)
    } else {
      // Arama terimi yoksa boş bir arama yap ki dropdown açılsın
      setProductSearchTerm(" ")
      setTimeout(() => setProductSearchTerm(""), 100)
    }
  }

  const handleCustomerInputBlur = () => {
    setTimeout(() => {
      setShowCustomerDropdown(false)
    }, 200)
  }

  const handleProductInputBlur = () => {
    setTimeout(() => {
      setShowProductDropdown(false)
    }, 200)
  }

  // Müşteri arama
  useEffect(() => {
    async function searchCustomers() {
      if (!customerSearchTerm || customerSearchTerm.trim() === "") {
        if (customerSearchTerm === "") {
          setCustomers([])
        }
        return
      }

      setLoadingCustomers(true)
      try {
        // Önce doğru sütun adlarını öğrenmek için bir müşteri kaydı alalım
        const { data: sampleCustomer, error: sampleError } = await supabase
          .from("customers")
          .select("*")
          .limit(1)
          .single()

        if (sampleError) {
          console.error("Sample customer error:", sampleError)
          toast({ title: "Müşteriler aranamadı", description: sampleError.message, variant: "destructive" })
          setLoadingCustomers(false)
          return
        }

        console.log("Sample customer:", sampleCustomer)

        // Mevcut sütun adlarını kullanarak arama yapalım
        const searchTerm = customerSearchTerm.trim()
        const searchQuery = Object.keys(sampleCustomer)
          .filter(
            (column) =>
              typeof sampleCustomer[column] === "string" &&
              !["created_at", "updated_at", "deleted_at"].includes(column),
          )
          .map((column) => `${column}.ilike.%${searchTerm}%`)
          .join(",")

        const { data, error } = await supabase
          .from("customers")
          .select("mid, contact_name, phone, email")
          .or(searchQuery)
          .order("contact_name")
          .limit(10)

        if (error) {
          console.error("Customer search error:", error)
          toast({ title: "Müşteriler aranamadı", description: error.message, variant: "destructive" })
        } else {
          console.log("Customers found:", data)
          setCustomers(data || [])
          if (data && data.length > 0) {
            setShowCustomerDropdown(true)
          }
        }
      } catch (error) {
        console.error("Unexpected error in customer search:", error)
        toast({ title: "Müşteriler aranamadı", description: "Beklenmeyen bir hata oluştu", variant: "destructive" })
      } finally {
        setLoadingCustomers(false)
      }
    }

    const timer = setTimeout(() => {
      if (customerSearchTerm && !selectedCustomer) {
        searchCustomers()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [customerSearchTerm, selectedCustomer, supabase, toast])

  // Ürün arama
  useEffect(() => {
    async function searchProducts() {
      if (!productSearchTerm || productSearchTerm.trim() === "") {
        if (productSearchTerm === "") {
          setProducts([])
        }
        return
      }

      setLoadingProducts(true)
      try {
        // Önce doğru sütun adlarını öğrenmek için bir ürün kaydı alalım
        const { data: sampleProduct, error: sampleError } = await supabase
          .from("products")
          .select("*")
          .limit(1)
          .single()

        if (sampleError) {
          console.error("Sample product error:", sampleError)
          toast({ title: "Ürünler aranamadı", description: sampleError.message, variant: "destructive" })
          setLoadingProducts(false)
          return
        }

        console.log("Sample product:", sampleProduct)

        // Mevcut sütun adlarını kullanarak arama yapalım
        const searchTerm = productSearchTerm.trim()
        const searchQuery = Object.keys(sampleProduct)
          .filter(
            (column) =>
              typeof sampleProduct[column] === "string" && !["created_at", "updated_at", "deleted_at"].includes(column),
          )
          .map((column) => `${column}.ilike.%${searchTerm}%`)
          .join(",")

        const { data, error } = await supabase
          .from("products")
          .select("stock_code, name, sale_price")
          .or(searchQuery)
          .order("name")
          .limit(10)

        if (error) {
          console.error("Product search error:", error)
          toast({ title: "Ürünler aranamadı", description: error.message, variant: "destructive" })
        } else {
          console.log("Products found:", data)
          setProducts(data || [])
          if (data && data.length > 0) {
            setShowProductDropdown(true)
          }
        }
      } catch (error) {
        console.error("Unexpected error in product search:", error)
        toast({ title: "Ürünler aranamadı", description: "Beklenmeyen bir hata oluştu", variant: "destructive" })
      } finally {
        setLoadingProducts(false)
      }
    }

    const timer = setTimeout(() => {
      if (productSearchTerm && !selectedProduct) {
        searchProducts()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [productSearchTerm, selectedProduct, supabase, toast])

  // Müşteri seçildiğinde
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    const customerName = customer.contact_name || ""
    setCustomerSearchTerm(customerName)
    form.setValue("customer_mid", customer.mid)
    form.setValue("customer_name", customerName)
    form.setValue("customer_phone", customer.phone || "")
    form.setValue("customer_email", customer.email || "")
    setCustomers([])
    setShowCustomerDropdown(false)
  }

  // Ürün seçildiğinde
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setProductSearchTerm(product.name)
    form.setValue("product_stock_code", product.stock_code)
    form.setValue("product_name", product.name)
    setProducts([])
    setShowProductDropdown(false)
  }

  // Müşteri arama temizleme
  const clearCustomerSearch = () => {
    setSelectedCustomer(null)
    setCustomerSearchTerm("")
    form.setValue("customer_mid", null)
    form.setValue("customer_name", "")
    form.setValue("customer_phone", "")
    form.setValue("customer_email", "")
    setCustomers([])
    setShowCustomerDropdown(false)
  }

  // Ürün arama temizleme
  const clearProductSearch = () => {
    setSelectedProduct(null)
    setProductSearchTerm("")
    form.setValue("product_stock_code", null)
    form.setValue("product_name", "")
    setProducts([])
    setShowProductDropdown(false)
  }

  // Form gönderimi
  async function onSubmit(data: ServiceFormValues) {
    try {
      if (initialData) {
        await updateServiceRequest(initialData.id, data)
        toast({
          title: "Servis Kaydı Güncellendi",
          description: "Servis kaydı başarıyla güncellendi.",
        })
      } else {
        const result = await createServiceRequest(data)
        toast({
          title: "Servis Kaydı Oluşturuldu",
          description: `Servis kaydı başarıyla oluşturuldu.`,
        })
      }
      router.push("/service")
      router.refresh()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Servis kaydı işlemi sırasında bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Müşteri Seçimi */}
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Müşteri Bilgileri</h3>

          {/* Müşteri Arama */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Müşteri ara..."
                className="pl-8 pr-8"
                value={customerSearchTerm}
                onChange={(e) => {
                  setCustomerSearchTerm(e.target.value)
                  if (selectedCustomer) {
                    setSelectedCustomer(null)
                  }
                }}
                onFocus={handleCustomerInputFocus}
                onBlur={handleCustomerInputBlur}
              />

              {/* Temizleme butonu */}
              {customerSearchTerm && (
                <button
                  type="button"
                  onClick={clearCustomerSearch}
                  className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Loading göstergesi */}
              {loadingCustomers && (
                <div className="absolute right-8 top-2.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}

              {/* Arama Sonuçları */}
              {showCustomerDropdown && customers.length > 0 && (
                <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto shadow-lg">
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {customers.map((customer) => (
                        <li
                          key={customer.mid}
                          className="p-3 hover:bg-muted cursor-pointer transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleCustomerSelect(customer)
                          }}
                        >
                          <div className="font-medium">{customer.contact_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.phone && <span>{customer.phone}</span>}
                            {customer.phone && customer.email && <span> • </span>}
                            {customer.email && <span>{customer.email}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Müşteri Form Alanları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Müşteri Adı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Müşteri adını girin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefon numarası" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="E-posta adresi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Ürün Seçimi */}
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Ürün Bilgileri</h3>

          {/* Ürün Arama */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ürün ara..."
                className="pl-8 pr-8"
                value={productSearchTerm}
                onChange={(e) => {
                  setProductSearchTerm(e.target.value)
                  if (selectedProduct) {
                    setSelectedProduct(null)
                  }
                }}
                onFocus={handleProductInputFocus}
                onBlur={handleProductInputBlur}
              />

              {/* Temizleme butonu */}
              {productSearchTerm && (
                <button
                  type="button"
                  onClick={clearProductSearch}
                  className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Loading göstergesi */}
              {loadingProducts && (
                <div className="absolute right-8 top-2.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}

              {/* Arama Sonuçları */}
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
                            <span>{product.stock_code}</span>
                            {product.sale_price && <span>₺{product.sale_price.toFixed(2)}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <FormField
              control={form.control}
              name="product_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ürün Adı *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ürün adını girin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Servis Detayları */}
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Servis Detayları</h3>

          <FormField
            control={form.control}
            name="fault_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arıza Açıklaması *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Arıza detaylarını açıklayın..." className="resize-none" rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durum</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Beklemede</SelectItem>
                      <SelectItem value="in_progress">Tamirde</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                      <SelectItem value="delivered">Teslim Edildi</SelectItem>
                      <SelectItem value="cancelled">İptal Edildi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Öncelik</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Öncelik seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="urgent">Acil</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technician_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teknisyen</FormLabel>
                  <FormControl>
                    <Input placeholder="Teknisyen adı" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="estimated_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahmini Maliyet (₺)</FormLabel>
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

            <FormField
              control={form.control}
              name="actual_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gerçek Maliyet (₺)</FormLabel>
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

          <FormField
            control={form.control}
            name="service_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servis Notları</FormLabel>
                <FormControl>
                  <Textarea placeholder="Servis süreci ile ilgili notlar..." className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Güncelleniyor..." : "Kaydediliyor..."}
              </>
            ) : initialData ? (
              "Güncelle"
            ) : (
              "Kaydet"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
