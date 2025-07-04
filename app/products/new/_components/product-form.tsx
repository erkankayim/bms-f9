"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { addProductAction, updateProductAction } from "../_actions/products-actions"
import { useToast } from "@/components/ui/use-toast"

interface ProductFormProps {
  product?: any
  isEditing?: boolean
}

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      const productData = {
        stock_code: formData.get("stock_code") as string,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        quantity_on_hand: Number(formData.get("quantity_on_hand") as string) || 0,
        min_stock_level: Number(formData.get("min_stock_level") as string) || 0,
        purchase_price: Number(formData.get("purchase_price") as string) || null,
        purchase_price_currency: (formData.get("purchase_price_currency") as string) || "TRY",
        sale_price: Number(formData.get("sale_price") as string) || null,
        sale_price_currency: (formData.get("sale_price_currency") as string) || "TRY",
        vat_rate: Number(formData.get("vat_rate") as string) || 0.18,
        barcode: formData.get("barcode") as string,
        tags: formData.get("tags") as string,
        image_urls: null,
        variants: null,
        imagesToDelete: null,
        category_id: Number(formData.get("category_id") as string) || null,
      }

      let result
      if (isEditing && product) {
        result = await updateProductAction(product.stock_code, productData)
      } else {
        result = await addProductAction(productData)
      }

      if (result.success) {
        toast({
          title: "Başarılı",
          description: isEditing
            ? `${productData.name} adlı ürün başarıyla güncellendi`
            : `${productData.name} adlı ürün başarıyla eklendi`,
          variant: "default",
        })
        router.push("/products")
      } else if (result.error) {
        toast({
          title: "Hata",
          description: result.error,
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Ürün Düzenle" : "Yeni Ürün"}</CardTitle>
        <CardDescription>{isEditing ? "Ürün bilgilerini güncelleyin" : "Yeni bir ürün ekleyin"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_code">Stok Kodu *</Label>
              <Input
                id="stock_code"
                name="stock_code"
                defaultValue={product?.stock_code || ""}
                required
                disabled={isLoading || isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Ürün Adı *</Label>
              <Input id="name" name="name" defaultValue={product?.name || ""} required disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity_on_hand">Mevcut Stok</Label>
              <Input
                id="quantity_on_hand"
                name="quantity_on_hand"
                type="number"
                defaultValue={product?.quantity_on_hand || 0}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock_level">Minimum Stok Seviyesi</Label>
              <Input
                id="min_stock_level"
                name="min_stock_level"
                type="number"
                defaultValue={product?.min_stock_level || 0}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Alış Fiyatı</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                defaultValue={product?.purchase_price || ""}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Satış Fiyatı</Label>
              <Input
                id="sale_price"
                name="sale_price"
                type="number"
                step="0.01"
                defaultValue={product?.sale_price || ""}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat_rate">KDV Oranı</Label>
              <Select name="vat_rate" defaultValue={product?.vat_rate?.toString() || "0.18"} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">%0</SelectItem>
                  <SelectItem value="0.01">%1</SelectItem>
                  <SelectItem value="0.08">%8</SelectItem>
                  <SelectItem value="0.18">%18</SelectItem>
                  <SelectItem value="0.20">%20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barkod</Label>
              <Input id="barcode" name="barcode" defaultValue={product?.barcode || ""} disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description || ""}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Etiketler</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={product?.tags || ""}
              placeholder="Virgülle ayırın"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Ekle"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/products")} disabled={isLoading}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
