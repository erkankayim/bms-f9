"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Upload, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateProduct } from "../_actions/update-product-action"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

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

const CURRENCIES = ["TRY", "USD", "EUR", "GBP"]

interface Variant {
  id: string
  name: string
  values: string[]
}

interface EditProductFormProps {
  product: any
  suppliers: any[]
}

export default function EditProductForm({ product, suppliers }: EditProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(product.image_urls || [])
  const [formData, setFormData] = useState({
    stock_code: product.stock_code,
    name: product.name,
    description: product.description || "",
    category_name: product.category_name || "",
    purchase_price: product.purchase_price?.toString() || "",
    purchase_price_currency: product.purchase_price_currency || "TRY",
    sale_price: product.sale_price?.toString() || "",
    sale_price_currency: product.sale_price_currency || "TRY",
    stock_quantity: product.stock_quantity?.toString() || "",
    min_stock_level: product.min_stock_level?.toString() || "",
    supplier_id: product.supplier_id?.toString() || "",
    variants: product.variants || [],
    image_urls: product.image_urls || [],
  })

  const [newVariant, setNewVariant] = useState({ name: "", value: "" })

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return

    const supabase = createClient()
    const newImageUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file)

      if (uploadError) {
        toast({
          title: "Hata",
          description: `Resim yüklenirken hata oluştu: ${uploadError.message}`,
          variant: "destructive",
        })
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath)

      newImageUrls.push(publicUrl)
    }

    setImageUrls((prev) => [...prev, ...newImageUrls])
    setFormData((prev) => ({
      ...prev,
      image_urls: [...prev.image_urls, ...newImageUrls],
    }))
  }

  const removeImage = async (index: number) => {
    const imageUrl = imageUrls[index]
    const supabase = createClient()

    // Extract file path from URL
    const urlParts = imageUrl.split("/")
    const filePath = `products/${urlParts[urlParts.length - 1]}`

    await supabase.storage.from("product-images").remove([filePath])

    const newImageUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newImageUrls)
    setFormData((prev) => ({
      ...prev,
      image_urls: newImageUrls,
    }))
  }

  const addVariant = () => {
    if (!newVariant.name || !newVariant.value) return

    const existingVariantIndex = formData.variants.findIndex((v: Variant) => v.name === newVariant.name)

    if (existingVariantIndex >= 0) {
      // Add value to existing variant
      const updatedVariants = [...formData.variants]
      if (!updatedVariants[existingVariantIndex].values.includes(newVariant.value)) {
        updatedVariants[existingVariantIndex].values.push(newVariant.value)
        setFormData((prev) => ({ ...prev, variants: updatedVariants }))
      }
    } else {
      // Create new variant
      const newVariantObj: Variant = {
        id: Date.now().toString(),
        name: newVariant.name,
        values: [newVariant.value],
      }
      setFormData((prev) => ({
        ...prev,
        variants: [...prev.variants, newVariantObj],
      }))
    }

    setNewVariant({ name: "", value: "" })
  }

  const removeVariant = (variantId: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v: Variant) => v.id !== variantId),
    }))
  }

  const removeVariantValue = (variantId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants
        .map((v: Variant) => (v.id === variantId ? { ...v, values: v.values.filter((val) => val !== value) } : v))
        .filter((v: Variant) => v.values.length > 0),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateProduct(product.id, {
        ...formData,
        purchase_price: Number.parseFloat(formData.purchase_price) || 0,
        sale_price: Number.parseFloat(formData.sale_price) || 0,
        stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
        min_stock_level: Number.parseInt(formData.min_stock_level) || 0,
        supplier_id: formData.supplier_id || null,
      })

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Ürün başarıyla güncellendi",
        })
        router.push(`/products/${product.stock_code}`)
      } else {
        toast({
          title: "Hata",
          description: result.error || "Ürün güncellenirken hata oluştu",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/products/${product.stock_code}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Ürün Düzenle</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{product.name} - Düzenle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock_code">Stok Kodu *</Label>
                <Input
                  id="stock_code"
                  value={formData.stock_code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stock_code: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category_name}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category_name: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Alış Fiyatı</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, purchase_price: e.target.value }))}
                    placeholder="0.00"
                  />
                  <Select
                    value={formData.purchase_price_currency}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, purchase_price_currency: value }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Satış Fiyatı *</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sale_price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                  <Select
                    value={formData.sale_price_currency}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, sale_price_currency: value }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="stock_quantity">Stok Miktarı</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="min_stock_level">Minimum Stok Seviyesi</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  value={formData.min_stock_level}
                  onChange={(e) => setFormData((prev) => ({ ...prev, min_stock_level: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="supplier">Tedarikçi</Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, supplier_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tedarikçi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Images */}
            <div>
              <Label>Ürün Resimleri</Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Resim yüklemek için tıklayın</p>
                  </div>
                </label>
              </div>

              {imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Variants */}
            <div>
              <Label>Ürün Varyantları</Label>
              <div className="mt-2 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Varyant adı (örn: Renk, Beden)"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Değer (örn: Kırmızı, XL)"
                    value={newVariant.value}
                    onChange={(e) => setNewVariant((prev) => ({ ...prev, value: e.target.value }))}
                  />
                  <Button type="button" onClick={addVariant}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.variants.map((variant: Variant) => (
                  <div key={variant.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{variant.name}</h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(variant.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variant.values.map((value) => (
                        <Badge key={value} variant="secondary" className="flex items-center gap-1">
                          {value}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeVariantValue(variant.id, value)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Güncelleniyor..." : "Ürünü Güncelle"}
              </Button>
              <Link href={`/products/${product.stock_code}`}>
                <Button type="button" variant="outline">
                  İptal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
