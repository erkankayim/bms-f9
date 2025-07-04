"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createProduct, updateProduct } from "../actions"
import { useToast } from "@/hooks/use-toast"

type Category = {
  id: number
  name: string
}

type Product = {
  id: number
  stock_code: string
  name: string
  description: string | null
  category_id: number | null
  quantity_on_hand: number | null
  minimum_stock_level: number | null
  purchase_price: number | null
  selling_price: number | null
  created_at: string
  updated_at: string
}

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      if (product) {
        const result = await updateProduct(product.id, formData)
        if (result.success) {
          toast({
            title: "Başarılı",
            description: "Ürün başarıyla güncellendi.",
          })
          router.push("/products")
        } else {
          toast({
            title: "Hata",
            description: result.error || "Ürün güncellenirken bir hata oluştu.",
            variant: "destructive",
          })
        }
      } else {
        const result = await createProduct(formData)
        if (result.success) {
          toast({
            title: "Başarılı",
            description: "Ürün başarıyla oluşturuldu.",
          })
          router.push("/products")
        } else {
          toast({
            title: "Hata",
            description: result.error || "Ürün oluşturulurken bir hata oluştu.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{product ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</CardTitle>
          <CardDescription>
            {product ? "Mevcut ürün bilgilerini güncelleyin." : "Yeni bir ürün eklemek için aşağıdaki formu doldurun."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Temel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_code">Stok Kodu *</Label>
                  <Input
                    id="stock_code"
                    name="stock_code"
                    defaultValue={product?.stock_code || ""}
                    placeholder="Örn: PRD-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category_id">Kategori</Label>
                  <Select name="category_id" defaultValue={product?.category_id?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={product?.name || ""}
                  placeholder="Ürün adını girin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description || ""}
                  placeholder="Ürün açıklaması (isteğe bağlı)"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Stok Bilgileri */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Stok Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity_on_hand">Mevcut Stok</Label>
                  <Input
                    id="quantity_on_hand"
                    name="quantity_on_hand"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product?.quantity_on_hand?.toString() || "0"}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimum_stock_level">Minimum Stok Seviyesi</Label>
                  <Input
                    id="minimum_stock_level"
                    name="minimum_stock_level"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product?.minimum_stock_level?.toString() || "0"}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Fiyat Bilgileri */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fiyat Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Alış Fiyatı (₺) *</Label>
                  <Input
                    id="purchase_price"
                    name="purchase_price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product?.purchase_price?.toString() || ""}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-sm text-gray-500">KDV hariç alış fiyatı</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling_price">Satış Fiyatı (₺)</Label>
                  <Input
                    id="selling_price"
                    name="selling_price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product?.selling_price?.toString() || ""}
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-500">KDV dahil satış fiyatı</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Butonları */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
                {isSubmitting ? "Kaydediliyor..." : product ? "Güncelle" : "Oluştur"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
