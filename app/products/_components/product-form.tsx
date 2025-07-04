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
import { toast } from "sonner"

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  stock_code: string
  name: string
  description: string | null
  category_id: number
  quantity_on_hand: number
  minimum_stock_level: number
  purchase_price: number
  selling_price: number
}

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      if (product) {
        await updateProduct(product.id, formData)
        toast.success("Ürün başarıyla güncellendi")
      } else {
        await createProduct(formData)
        toast.success("Ürün başarıyla oluşturuldu")
      }
      router.push("/products")
      router.refresh()
    } catch (error) {
      toast.error("Bir hata oluştu")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={onSubmit} className="space-y-6">
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
                name="stock_code"
                defaultValue={product?.stock_code}
                placeholder="Örn: ELC-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Kategori *</Label>
              <Select name="category_id" defaultValue={product?.category_id?.toString()} required>
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
            <Input id="name" name="name" defaultValue={product?.name} placeholder="Ürün adını girin" required />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stok Bilgileri</CardTitle>
          <CardDescription>Ürünün stok durumu ve minimum stok seviyesi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_on_hand">Mevcut Stok</Label>
              <Input
                id="quantity_on_hand"
                name="quantity_on_hand"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.quantity_on_hand || 0}
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
                defaultValue={product?.minimum_stock_level || 0}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fiyat Bilgileri</CardTitle>
          <CardDescription>Alış ve satış fiyatları (KDV dahil değildir)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Alış Fiyatı (₺) *</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.purchase_price || ""}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-muted-foreground">KDV hariç alış fiyatı</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price">Satış Fiyatı (₺)</Label>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.selling_price || ""}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">KDV hariç satış fiyatı</p>
            </div>
          </div>

          {product?.purchase_price && product?.selling_price && product.purchase_price > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Kar Marjı:</span>
                  <span className="font-medium">
                    {(((product.selling_price - product.purchase_price) / product.purchase_price) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Birim Kar:</span>
                  <span className="font-medium">₺{(product.selling_price - product.purchase_price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : product ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  )
}
