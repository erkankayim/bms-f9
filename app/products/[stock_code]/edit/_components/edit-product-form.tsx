"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Plus, X, Upload } from "lucide-react"
import { updateProductAction } from "../../../new/_actions/products-actions"
import { toast } from "sonner"
import Image from "next/image"

const CATEGORIES = [
  "Elektronik",
  "Bilgisayar & Teknoloji",
  "Telefon & Aksesuar",
  "Ev & Yaşam",
  "Mutfak Gereçleri",
  "Mobilya",
  "Giyim & Aksesuar",
  "Ayakkabı & Çanta",
  "Kozmetik & Kişisel Bakım",
  "Spor & Outdoor",
  "Otomotiv",
  "Bahçe & Yapı Market",
  "Kitap & Kırtasiye",
  "Oyuncak & Hobi",
  "Sağlık & Medikal",
  "Gıda & İçecek",
  "Pet Shop",
  "Bebek & Çocuk",
  "Takı & Saat",
  "Diğer",
]

const CURRENCIES = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
  { value: "GBP", label: "£ GBP" },
]

const productSchema = z.object({
  stock_code: z.string().min(1, "Stok kodu gerekli"),
  name: z.string().min(1, "Ürün adı gerekli"),
  description: z.string().optional(),
  category_name: z.string().min(1, "Kategori seçimi gerekli"),
  purchase_price: z.number().min(0, "Alış fiyatı 0'dan büyük olmalı"),
  purchase_price_currency: z.string().default("TRY"),
  sale_price: z.number().min(0, "Satış fiyatı 0'dan büyük olmalı"),
  sale_price_currency: z.string().default("TRY"),
  stock_quantity: z.number().min(0, "Stok miktarı 0'dan büyük olmalı"),
  min_stock_level: z.number().min(0, "Minimum stok seviyesi 0'dan büyük olmalı"),
  vat_rate: z.number().min(0).max(1, "KDV oranı 0-1 arasında olmalı"),
  barcode: z.string().optional(),
  tags: z.string().optional(),
  supplier_id: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface Variant {
  type: string
  values: string[]
}

interface Supplier {
  id: string
  name: string
  company_name?: string
}

interface EditProductFormProps {
  product: any
  suppliers: Supplier[]
}

export default function EditProductForm({ product, suppliers }: EditProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<Array<{ url: string }>>(product.image_urls || [])
  const [variants, setVariants] = useState<Variant[]>(product.variants || [])
  const [newVariant, setNewVariant] = useState({ type: "", values: "" })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock_code: product.stock_code || "",
      name: product.name || "",
      description: product.description || "",
      category_name: product.category_name || "Diğer",
      purchase_price: product.purchase_price || 0,
      purchase_price_currency: product.purchase_price_currency || "TRY",
      sale_price: product.sale_price || 0,
      sale_price_currency: product.sale_price_currency || "TRY",
      stock_quantity: product.stock_quantity || product.quantity_on_hand || 0,
      min_stock_level: product.min_stock_level || product.minimum_stock_level || 5,
      vat_rate: product.vat_rate || 0.18,
      barcode: product.barcode || "",
      tags: product.tags || "",
      supplier_id: product.supplier_id || "",
    },
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const totalImages = existingImages.length + images.length + files.length
    if (totalImages > 5) {
      toast.error("Maksimum 5 resim yükleyebilirsiniz")
      return
    }

    const newImages = [...images, ...files]
    const newPreviews = [...imagePreviews, ...files.map((file) => URL.createObjectURL(file))]

    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const removeNewImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)

    // Clean up URL
    URL.revokeObjectURL(imagePreviews[index])

    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    if (newVariant.type && newVariant.values) {
      const values = newVariant.values
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
      if (values.length > 0) {
        setVariants([...variants, { type: newVariant.type, values }])
        setNewVariant({ type: "", values: "" })
      }
    }
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  async function onSubmit(values: ProductFormValues) {
    setIsLoading(true)

    try {
      const formData = new FormData()

      // Add form values
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      // Add new images
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image)
      })

      // Add existing images
      formData.append("existing_images", JSON.stringify(existingImages))

      // Add variants
      if (variants.length > 0) {
        formData.append("variants", JSON.stringify(variants))
      }

      const result = await updateProductAction(product.stock_code, formData)

      if (result.success) {
        toast.success("Ürün başarıyla güncellendi")
        router.push(`/products/${product.stock_code}`)
        router.refresh()
      } else {
        toast.error(result.error || "Bir hata oluştu")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const watchedPurchasePrice = form.watch("purchase_price")
  const watchedSalePrice = form.watch("sale_price")
  const profitMargin =
    watchedPurchasePrice > 0
      ? (((watchedSalePrice - watchedPurchasePrice) / watchedPurchasePrice) * 100).toFixed(1)
      : "0"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
            <CardDescription>Ürünün temel bilgilerini güncelleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="stock_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Kodu *</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: ELC-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ürün açıklaması (isteğe bağlı)" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barkod</FormLabel>
                    <FormControl>
                      <Input placeholder="Barkod numarası" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tedarikçi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tedarikçi seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Tedarikçi yok</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.company_name || supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiketler</FormLabel>
                  <FormControl>
                    <Input placeholder="Etiketleri virgülle ayırın (örn: elektronik, telefon)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Fiyat Bilgileri</CardTitle>
            <CardDescription>Alış ve satış fiyatları (KDV dahil değildir)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="purchase_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alış Fiyatı *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchase_price_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alış Para Birimi</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Satış Fiyatı *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sale_price_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Satış Para Birimi</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="vat_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KDV Oranı</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number.parseFloat(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">%0</SelectItem>
                      <SelectItem value="0.01">%1</SelectItem>
                      <SelectItem value="0.08">%8</SelectItem>
                      <SelectItem value="0.18">%18</SelectItem>
                      <SelectItem value="0.20">%20</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedPurchasePrice > 0 && watchedSalePrice > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Kar Marjı:</span>
                    <span className="font-medium">%{profitMargin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Birim Kar:</span>
                    <span className="font-medium">{(watchedSalePrice - watchedPurchasePrice).toFixed(2)} TL</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle>Stok Bilgileri</CardTitle>
            <CardDescription>Ürünün stok durumu ve minimum stok seviyesi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mevcut Stok</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stok Seviyesi</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Ürün Resimleri</CardTitle>
            <CardDescription>Ürün için maksimum 5 resim yükleyebilirsiniz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Mevcut Resimler</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={`Existing ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div className="flex items-center gap-4">
              <label htmlFor="images" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-muted-foreground rounded-lg hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  <span>Yeni Resim Ekle</span>
                </div>
              </label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <span className="text-sm text-muted-foreground">{existingImages.length + images.length}/5 resim</span>
            </div>

            {imagePreviews.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Yeni Resimler</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt={`New Preview ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Ürün Varyantları</CardTitle>
            <CardDescription>Ürün için farklı varyantlar ekleyebilirsiniz (renk, beden, vb.)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Input
                placeholder="Varyant tipi (örn: Renk)"
                value={newVariant.type}
                onChange={(e) => setNewVariant({ ...newVariant, type: e.target.value })}
              />
              <Input
                placeholder="Değerler (virgülle ayırın: kırmızı, mavi, yeşil)"
                value={newVariant.values}
                onChange={(e) => setNewVariant({ ...newVariant, values: e.target.value })}
              />
              <Button type="button" onClick={addVariant}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{variant.type}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {variant.values.map((value, valueIndex) => (
                          <Badge key={valueIndex} variant="secondary">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            İptal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Güncelleniyor..." : "Ürünü Güncelle"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
