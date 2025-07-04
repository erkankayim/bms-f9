"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { createSaleAction } from "../_actions/sales-actions"
import { useToast } from "@/components/ui/use-toast"

export function SaleForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState([{ product_stock_code: "", quantity: 1, unit_price: 0 }])
  const [isInstallment, setIsInstallment] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      // Form verilerini topla
      const saleData = {
        customer_mid: (formData.get("customer_mid") as string) || null,
        items: items.filter((item) => item.product_stock_code && item.quantity > 0),
        payment_method: formData.get("payment_method") as string,
        is_installment: isInstallment,
        installment_count: isInstallment ? Number(formData.get("installment_count")) : null,
        discount_amount: Number(formData.get("discount_amount")) || 0,
        notes: formData.get("notes") as string,
        total_amount: items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
        tax_amount: items.reduce((sum, item) => sum + item.quantity * item.unit_price * 0.18, 0),
        final_amount: 0, // Hesaplanacak
      }

      saleData.final_amount = saleData.total_amount + saleData.tax_amount - saleData.discount_amount

      const result = await createSaleAction(saleData)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: `Satış başarıyla oluşturuldu. Toplam: ${saleData.final_amount.toFixed(2)} TL`,
          variant: "default",
        })
        router.push("/sales")
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

  const addItem = () => {
    setItems([...items, { product_stock_code: "", quantity: 1, unit_price: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni Satış</CardTitle>
        <CardDescription>Yeni bir satış işlemi oluşturun</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_mid">Müşteri</Label>
              <Input id="customer_mid" name="customer_mid" placeholder="Müşteri ID (opsiyonel)" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Ödeme Yöntemi</Label>
              <Select name="payment_method" required disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme yöntemi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Nakit</SelectItem>
                  <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                  <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                  <SelectItem value="check">Çek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Satış Kalemleri</Label>
              <Button type="button" onClick={addItem} disabled={isLoading}>
                Kalem Ekle
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md">
                <div className="space-y-2">
                  <Label>Ürün Stok Kodu</Label>
                  <Input
                    value={item.product_stock_code}
                    onChange={(e) => updateItem(index, "product_stock_code", e.target.value)}
                    placeholder="Stok kodu"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Miktar</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                    min="1"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Birim Fiyat</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, "unit_price", Number(e.target.value))}
                    min="0"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Toplam</Label>
                  <div className="p-2 bg-muted rounded-md">{(item.quantity * item.unit_price).toFixed(2)} TL</div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={isLoading}
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_amount">İndirim Tutarı</Label>
              <Input
                id="discount_amount"
                name="discount_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Toplam Tutar</Label>
              <div className="p-2 bg-muted rounded-md font-medium">{totalAmount.toFixed(2)} TL</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_installment"
              checked={isInstallment}
              onCheckedChange={setIsInstallment}
              disabled={isLoading}
            />
            <Label htmlFor="is_installment">Taksitli Ödeme</Label>
          </div>

          {isInstallment && (
            <div className="space-y-2">
              <Label htmlFor="installment_count">Taksit Sayısı</Label>
              <Input
                id="installment_count"
                name="installment_count"
                type="number"
                min="2"
                max="36"
                required={isInstallment}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea id="notes" name="notes" placeholder="Satış notları..." disabled={isLoading} />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Oluşturuluyor..." : "Satış Oluştur"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/sales")} disabled={isLoading}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
