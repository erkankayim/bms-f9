"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, get } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ImagePlus, XCircle } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { addProductAction, updateProductAction } from "../_actions/products-actions"
import { ProductVariantItem } from "./product-variant-item"

const currencySchema = z.enum(["TRY", "USD", "EUR", "GBP"])

const variantValueSchema = z.object({
  value: z.string().min(1, "Varyant değeri boş olamaz"),
})

const variantSchema = z.object({
  type: z.string().min(1, "Varyant tipi boş olamaz"),
  values: z.array(variantValueSchema).min(1, "En az bir varyant değeri gereklidir"),
})

const productFormSchema = z.object({
  stock_code: z.string().min(1, "Stok kodu gereklidir"),
  name: z.string().min(1, "Ürün adı gereklidir"),
  description: z.string().optional().default(""),
  category_id: z.coerce.number().int().positive("Kategori seçimi gereklidir.").optional().nullable(),
  quantity_on_hand: z.coerce.number().int().min(0, "Stok miktarı negatif olamaz").optional().default(0),
  min_stock_level: z.coerce.number().int().min(0, "Minimum stok seviyesi negatif olamaz").optional().default(0), // YENİ ALAN
  purchase_price: z.coerce.number().min(0, "Alış fiyatı negatif olamaz").optional().nullable(),
  purchase_price_currency: currencySchema.default("TRY"),
  sale_price: z.coerce.number().min(0, "Satış fiyatı negatif olamaz").optional().nullable(),
  sale_price_currency: currencySchema.default("TRY"),
  vat_rate: z.coerce
    .number()
    .min(0, "KDV oranı negatif olamaz")
    .max(1, "KDV oranı 1'den büyük olamaz")
    .optional()
    .default(0.18),
  barcode: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  images: z.array(z.instanceof(File)).optional().default([]),
  variants: z.array(variantSchema).optional().default([]),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

interface ExistingImage {
  url: string
}

interface Category {
  id: number
  name: string
}

interface ProductFormProps {
  initialData?: Partial<ProductFormValues> & {
    image_urls?: ExistingImage[] | null
    category_id?: number | null
    purchase_price_currency?: string | null
    sale_price_currency?: string | null
    min_stock_level?: number | null // YENİ ALAN
  }
  isEditMode?: boolean
  productId?: string
}

const currencyOptions = [
  { value: "TRY", label: "TRY (Türk Lirası)" },
  { value: "USD", label: "USD (ABD Doları)" },
  { value: "EUR", label: "EUR (Euro)" },
  { value: "GBP", label: "GBP (İngiliz Sterlini)" },
]

export function ProductForm({ initialData, isEditMode = false, productId }: ProductFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<ExistingImage[]>(initialData?.image_urls || [])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...initialData,
      category_id: initialData?.category_id || null,
      purchase_price_currency: (initialData?.purchase_price_currency as "TRY" | "USD" | "EUR" | "GBP") || "TRY",
      sale_price_currency: (initialData?.sale_price_currency as "TRY" | "USD" | "EUR" | "GBP") || "TRY",
      min_stock_level: initialData?.min_stock_level || 0, // YENİ ALAN
    },
  })

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from("categories").select("id, name").order("name")
      if (error) {
        toast({ title: "Kategoriler Yüklenemedi", description: error.message, variant: "destructive" })
      } else {
        setCategories(data || [])
      }
    }
    fetchCategories()
  }, [supabase, toast])

  useEffect(() => {
    if (initialData) {
      const { image_urls, ...restInitialData } = initialData
      form.reset({
        ...restInitialData,
        category_id: initialData.category_id || null,
        purchase_price_currency: (initialData.purchase_price_currency as "TRY" | "USD" | "EUR" | "GBP") || "TRY",
        sale_price_currency: (initialData.sale_price_currency as "TRY" | "USD" | "EUR" | "GBP") || "TRY",
        min_stock_level: initialData.min_stock_level || 0, // YENİ ALAN
      })
      setExistingImageUrls(image_urls || [])
      setNewImagePreviews([])
      setImagesToDelete([])
    }
  }, [initialData, form])

  const {
    fields: variantFields,
    append: appendVariantType,
    remove: removeVariantType,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  const getFormErrorMessage = (name: any): string | undefined => {
    const error = get(form.formState.errors, name)
    return error?.message as string | undefined
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const currentNewFiles = form.getValues("images") || []
    form.setValue("images", [...currentNewFiles, ...files], { shouldValidate: true, shouldDirty: true })

    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setNewImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const removeNewImagePreview = (index: number) => {
    const currentNewFiles = form.getValues("images") || []
    const updatedNewFiles = currentNewFiles.filter((_, i) => i !== index)
    form.setValue("images", updatedNewFiles, { shouldValidate: true, shouldDirty: true })

    const oldPreview = newImagePreviews[index]
    const updatedPreviews = newImagePreviews.filter((_, i) => i !== index)
    setNewImagePreviews(updatedPreviews)
    if (oldPreview) {
      URL.revokeObjectURL(oldPreview)
    }
  }

  const removeExistingImage = useCallback((index: number) => {
    setExistingImageUrls((prev) => {
      const imageToRemove = prev[index]
      if (imageToRemove && imageToRemove.url) {
        setImagesToDelete((prevDelete) => [...prevDelete, imageToRemove.url])
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  useEffect(() => {
    return () => {
      newImagePreviews.forEach(URL.revokeObjectURL)
    }
  }, [newImagePreviews])

  async function onSubmit(data: ProductFormValues) {
    setIsUploading(true)
    const newlyUploadedImageUrls: { url: string }[] = []

    if (data.images && data.images.length > 0) {
      for (const imageFile of data.images) {
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "_")}`
        const { error: uploadError } = await supabase.storage.from("product_images").upload(fileName, imageFile)

        if (uploadError) {
          toast({ title: "Resim Yükleme Hatası", description: uploadError.message, variant: "destructive" })
          setIsUploading(false)
          return
        }
        const { data: publicUrlData } = supabase.storage.from("product_images").getPublicUrl(fileName)
        if (publicUrlData) {
          newlyUploadedImageUrls.push({ url: publicUrlData.publicUrl })
        } else {
          setIsUploading(false)
          return
        }
      }
    }
    setIsUploading(false)

    const finalImageUrls = [...existingImageUrls, ...newlyUploadedImageUrls]

    const productDataForAction = {
      ...data,
      image_urls: finalImageUrls,
      imagesToDelete: imagesToDelete,
      category_id: data.category_id ? Number(data.category_id) : null,
      min_stock_level: data.min_stock_level, // YENİ ALAN
    }
    // @ts-ignore
    delete productDataForAction.images

    let result
    if (isEditMode && productId) {
      result = await updateProductAction(productId, productDataForAction)
    } else if (!isEditMode) {
      result = await addProductAction(productDataForAction)
    } else {
      toast({ title: "Hata", description: "Geçersiz form modu.", variant: "destructive" })
      return
    }

    if (result.success) {
      toast({
        title: isEditMode ? "Ürün Güncellendi" : "Ürün Eklendi",
        description: `Ürün ${result.data?.name || data.name} başarıyla ${isEditMode ? "güncellendi" : "eklendi"}.`,
      })
      if (isEditMode && productId) {
        router.push(`/products/${productId}`)
      } else {
        router.push("/products")
      }
      router.refresh()
      if (!isEditMode) {
        form.reset({
          category_id: null,
          purchase_price_currency: "TRY",
          sale_price_currency: "TRY",
          min_stock_level: 0, // YENİ ALAN
        })
        setNewImagePreviews([])
        setExistingImageUrls([])
        setImagesToDelete([])
      }
    } else {
      toast({
        title: "Hata",
        description: result.error || `Ürün ${isEditMode ? "güncellenemedi" : "eklenemedi"}. Lütfen tekrar deneyin.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Temel Bilgiler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="stock_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stok Kodu (SKU) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: URN-001" {...field} readOnly={isEditMode} />
                  </FormControl>
                  {isEditMode && <FormDescription>Stok kodu düzenleme modunda değiştirilemez.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ürün Adı *</FormLabel>
                  <FormControl>
                    <Input placeholder="Harika Tişört" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Bir kategori seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length === 0 && (
                      <SelectItem value="loading" disabled>
                        Yükleniyor...
                      </SelectItem>
                    )}
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Ürünün ait olduğu kategoriyi seçin.</FormDescription>
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
                  <Textarea placeholder="Ürünün detaylı açıklaması..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Fiyatlandırma ve Stok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="quantity_on_hand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mevcut Stok Miktarı</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField // YENİ ALAN
              control={form.control}
              name="min_stock_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Stok Seviyesi</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Bu seviyenin altına düşünce uyarı verilir (0 ise uyarı yok).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div> {/* Boş div, grid yapısını korumak için */} </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alış Fiyatı</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                        }
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
                          <SelectValue placeholder="Para birimi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satış Fiyatı</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                        }
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
                          <SelectValue placeholder="Para birimi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
              name="vat_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KDV Oranı</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.18"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Örn: 18% için 0.18</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Tanımlayıcılar Bölümü */}
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Tanımlayıcılar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barkod (EAN/UPC)</FormLabel>
                  <FormControl>
                    <Input placeholder="Barkod değeri girin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiketler</FormLabel>
                  <FormControl>
                    <Input placeholder="Kırmızı, Deri, Sınırlı Üretim" {...field} />
                  </FormControl>
                  <FormDescription>Virgülle ayrılmış değerler.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Resim Yükleme */}
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Ürün Resimleri</h3>
          {isEditMode && existingImageUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Mevcut Resimler:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {existingImageUrls.map((img, index) => (
                  <div key={`existing-${index}`} className="relative group aspect-square">
                    <Image
                      src={img.url || "/placeholder.svg"}
                      alt={`Mevcut Resim ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeExistingImage(index)}
                      aria-label={`Mevcut resmi kaldır ${index + 1}`}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem>
                <FormLabel>
                  {isEditMode && existingImageUrls.length > 0 ? "Yeni Resim Ekle" : "Resim Dosyaları"}
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Resim Seç
                    </label>
                    <Input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </FormControl>
                <FormDescription>Bir veya daha fazla yeni resim dosyası seçin.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {newImagePreviews.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Yeni Resim Önizlemeleri:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {newImagePreviews.map((previewUrl, index) => (
                  <div key={`new-${index}`} className="relative group aspect-square">
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt={`Yeni Önizleme ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeNewImagePreview(index)}
                      aria-label={`Yeni resmi kaldır ${index + 1}`}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Varyantlar Bölümü */}
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Ürün Varyantları</h3>
          <FormDescription className="mb-2">Renk, beden gibi ürün çeşitlerini tanımlayın.</FormDescription>
          {variantFields.map((variantItem, variantIndex) => (
            <ProductVariantItem
              key={variantItem.id}
              variantIndex={variantIndex}
              control={form.control}
              register={form.register}
              removeVariantType={removeVariantType}
              getFormErrorMessage={getFormErrorMessage}
            />
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => appendVariantType({ type: "", values: [{ value: "" }] })}
          >
            Varyant Tipi Ekle
          </Button>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting || isUploading} className="w-full md:w-auto">
          {isUploading
            ? "Resimler Yükleniyor..."
            : form.formState.isSubmitting
              ? isEditMode
                ? "Ürün Güncelleniyor..."
                : "Ürün Ekleniyor..."
              : isEditMode
                ? "Değişiklikleri Kaydet"
                : "Ürünü Ekle"}
        </Button>
      </form>
    </Form>
  )
}
