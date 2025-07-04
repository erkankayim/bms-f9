"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Upload, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { addProductAction } from "../_actions/products-actions"
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
  { value: "TL", label: "₺ Türk Lirası" },
  { value: "USD", label: "$ Amerikan Doları" },
  { value: "EUR", label: "€ Euro" },
]

interface Variant {
  id: string
  name: string
  values: string[]
}

interface Supplier {
  id: number
  name: string
  company_name?: string
}

interface ProductFormProps {
  suppliers: Supplier[]
}

export default function ProductForm({ suppliers }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formData, setFormData] = useState({
    stock_code: "",
    name: "",
    description: "",
    category_id: "",
    purchase_price: "",
    purchase_price_currency: "TL",
    sale_price: "",
    sale_price_currency: "TL",
    quantity_on_hand: "0",
    barcode: "",
    tags: "",
    vat_rate: "18",
    supplier_id: "",
  })

  // Variants state
  const [variants, setVariants] = useState<Variant[]>([])
  const [newVariant, setNewVariant] = useState({ name: "", value: "" })

  // Images state
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limit to 5 images
    const newFiles = [...selectedImages, ...files].slice(0, 5)
    setSelectedImages(newFiles)

    // Create previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews(newPreviews)
  }

  const removeImage = (index: number) => {
    const newFiles = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)

    // Revoke old URL
    URL.revokeObjectURL(imagePreviews[index])

    setSelectedImages(newFiles)
    setImagePreviews(newPreviews)
  }

  const addVariant = () => {
    if (!newVariant.name || !newVariant.value) return

    const existingVariant = variants.find((v) => v.name === newVariant.name)

    if (existingVariant) {
      // Add value to existing variant
      if (!existingVariant.values.includes(newVariant.value)) {
        setVariants((prev) =>
          prev.map((v) => (v.name === newVariant.name ? { ...v, values: [...v.values, newVariant.value] } : v)),
        )
      }
    } else {
      // Create new variant
      setVariants((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newVariant.name,
          values: [newVariant.value],
        },
      ])
    }

    setNewVariant({ name: "", value: "" })
  }

  const removeVariantValue = (variantName: string, value: string) => {
    setVariants(
      (prev) =>
        prev
          .map((variant) => {
            if (variant.name === variantName) {
              const newValues = variant.values.filter((v) => v !== value)
              return newValues.length > 0 ? { ...variant, values: newValues } : null
            }
            return variant
          })
          .filter(Boolean) as Variant[],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.stock_code || !formData.name) {
      toast.error("Stok kodu ve ürün adı zorunludur")
      return
    }

    startTransition(async () => {
      try {
        const submitFormData = new FormData()

        // Add form fields
        Object.entries(formData).forEach(([key, value]) => {
          submitFormData.append(key, value)
        })

        // Add variants
        if (variants.length > 0) {
          submitFormData.append("variants", JSON.stringify(variants))
        }

        // Add images
        selectedImages.forEach((image) => {
          submitFormData.append("images", image)
        })

        const result = await addProductAction(submitFormData)

        if (result.success) {
          toast.success("Ürün başarıyla eklendi")
          router.push("/products")
        } else {
          toast.error(result.error || "Ürün eklenirken hata oluştu")
        }
      } catch (error) {
        console.error("Submit error:", error)
        toast.error("Beklenmeyen bir hata oluştu")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
          <CardDescription>Ürünün temel bilgilerini girin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_code">Stok Kodu *</Label>
              <Input
                id="stock_code"
                value={formData.stock_code}
                onChange={(e) => handleInputChange("stock_code", e.target.value)}
                placeholder="Örn: PRD001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barkod</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
                placeholder="Barkod numarası"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Ürün Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ürün adını girin"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Ürün açıklaması"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Tedarikçi</Label>
              <Select value={formData.supplier_id} onValueChange={(value) => handleInputChange("supplier_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tedarikçi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.company_name || supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Etiketler</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="Virgülle ayırın: elektronik, telefon, akıllı"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Fiyatlandırma</CardTitle>
          <CardDescription>Alış ve satış fiyatlarını belirleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Alış Fiyatı</h4>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <Select
                  value={formData.purchase_price_currency}
                  onValueChange={(value) => handleInputChange("purchase_price_currency", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Satış Fiyatı</h4>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => handleInputChange("sale_price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <Select
                  value={formData.sale_price_currency}
                  onValueChange={(value) => handleInputChange("sale_price_currency", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat_rate">KDV Oranı (%)</Label>
            <Input
              id="vat_rate"
              type="number"
              step="0.01"
              value={formData.vat_rate}
              onChange={(e) => handleInputChange("vat_rate", e.target.value)}
              placeholder="18"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Stok Bilgileri</CardTitle>
          <CardDescription>Mevcut stok miktarını girin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Mevcut Stok Miktarı</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity_on_hand}
              onChange={(e) => handleInputChange("quantity_on_hand", e.target.value)}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Ürün Resimleri</CardTitle>
          <CardDescription>Ürün resimlerini yükleyin (maksimum 5 adet)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
              disabled={selectedImages.length >= 5}
            >
              <Upload className="mr-2 h-4 w-4" />
              Resim Seç
            </Button>
            <span className="text-sm text-muted-foreground">{selectedImages.length}/5 resim seçildi</span>
          </div>

          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    width={150}
                    height={150}
                    className="rounded-lg object-cover w-full h-32"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Ürün Varyantları</CardTitle>
          <CardDescription>Renk, beden, malzeme gibi varyantları ekleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Varyant adı (örn: Renk)"
              value={newVariant.name}
              onChange={(e) => setNewVariant((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Değer (örn: Kırmızı)"
              value={newVariant.value}
              onChange={(e) => setNewVariant((prev) => ({ ...prev, value: e.target.value }))}
            />
            <Button type="button" onClick={addVariant}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {variants.length > 0 && (
            <div className="space-y-3">
              {variants.map((variant) => (
                <div key={variant.id} className="space-y-2">
                  <Label className="font-medium">{variant.name}</Label>
                  <div className="flex flex-wrap gap-2">
                    {variant.values.map((value) => (
                      <Badge key={value} variant="secondary" className="gap-1">
                        {value}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => removeVariantValue(variant.name, value)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ekleniyor..." : "Ürün Ekle"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
      </div>
    </form>
  )
}
