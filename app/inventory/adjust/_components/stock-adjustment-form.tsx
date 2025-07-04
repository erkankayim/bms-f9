"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { adjustStock } from "../../_actions/inventory-actions"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  stock_code: string
  product_name: string
  current_stock: number
}

interface StockAdjustmentFormProps {
  products: Product[]
}

export default function StockAdjustmentForm({ products }: StockAdjustmentFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease" | "set">()
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleProductSelect = (stockCode: string) => {
    const product = products.find((p) => p.stock_code === stockCode)
    setSelectedProduct(product || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProduct || !adjustmentType || !quantity || !reason) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
        duration: 1500,
      })
      return
    }

    const quantityNum = Number.parseInt(quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir miktar girin",
        variant: "destructive",
        duration: 1500,
      })
      return
    }

    if (adjustmentType === "decrease" && quantityNum > selectedProduct.current_stock) {
      toast({
        title: "Hata",
        description: "Azaltılacak miktar mevcut stoktan fazla olamaz",
        variant: "destructive",
        duration: 1500,
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("productId", selectedProduct.id.toString())
      formData.append("adjustmentType", adjustmentType)
      formData.append("quantity", quantity)
      formData.append("reason", reason)

      const result = await adjustStock(formData)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: result.success,
          duration: 1500,
        })
        router.push("/inventory")
      } else if (result.error) {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
          duration: 1500,
        })
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
        variant: "destructive",
        duration: 1500,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNewStock = () => {
    if (!selectedProduct || !quantity || !adjustmentType) return null

    const quantityNum = Number.parseInt(quantity)
    if (isNaN(quantityNum)) return null

    switch (adjustmentType) {
      case "increase":
        return selectedProduct.current_stock + quantityNum
      case "decrease":
        return Math.max(0, selectedProduct.current_stock - quantityNum)
      case "set":
        return quantityNum
      default:
        return null
    }
  }

  const newStock = calculateNewStock()

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Stok Ayarlama</CardTitle>
        <CardDescription>Ürün stoklarını artırın, azaltın veya belirli bir değere ayarlayın</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product">Ürün</Label>
            <Select onValueChange={handleProductSelect} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Ürün seçin" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.stock_code}>
                    {product.product_name} ({product.stock_code}) - Mevcut: {product.current_stock}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium">{selectedProduct.product_name}</h3>
              <p className="text-sm text-muted-foreground">
                Stok Kodu: {selectedProduct.stock_code} | Mevcut Stok: {selectedProduct.current_stock}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="adjustmentType">İşlem Türü</Label>
            <Select
              onValueChange={(value: "increase" | "decrease" | "set") => setAdjustmentType(value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="İşlem türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Stok Artır</SelectItem>
                <SelectItem value="decrease">Stok Azalt</SelectItem>
                <SelectItem value="set">Stok Belirle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Miktar</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Miktar girin"
              disabled={isLoading}
            />
          </div>

          {newStock !== null && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Yeni Stok:</span> {newStock}
                <span className="text-muted-foreground ml-2">
                  (Mevcut: {selectedProduct?.current_stock} → Yeni: {newStock})
                </span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Açıklama</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Stok ayarlama sebebini açıklayın"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Kaydediliyor..." : "Stok Ayarla"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
