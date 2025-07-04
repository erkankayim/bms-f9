"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createSaleAction } from "../_actions/sales-actions"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, Plus, Calculator, ShoppingCart, User, CreditCard, FileText } from "lucide-react"

interface Product {
  stock_code: string
  name: string
  unit_price: number
  quantity_on_hand: number
  vat_rate: number
}

interface Customer {
  mid: string
  contact_name: string
  email?: string
}

export function SaleForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState([
    {
      product_stock_code: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      unit_price_currency: "TRY",
      vat_rate: 18,
      item_total_gross: 0,
      item_total_net: 0,
    },
  ])
  const [isInstallment, setIsInstallment] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch products and customers on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products
        const productsResponse = await fetch("/api/products")
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData)
        }

        // Fetch customers
        const customersResponse = await fetch("/api/customers")
        if (customersResponse.ok) {
          const customersData = await customersResponse.json()
          setCustomers(customersData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const calculateItemTotals = (item: any) => {
    const grossTotal = item.quantity * item.unit_price
    const vatAmount = (grossTotal * item.vat_rate) / 100
    const netTotal = grossTotal + vatAmount

    return {
      item_total_gross: grossTotal,
      item_total_net: netTotal,
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // If product is selected, auto-fill details
    if (field === "product_stock_code") {
      const selectedProduct = products.find((p) => p.stock_code === value)
      if (selectedProduct) {
        newItems[index].product_name = selectedProduct.name
        newItems[index].unit_price = selectedProduct.unit_price
        newItems[index].vat_rate = selectedProduct.vat_rate
      }
    }

    // Recalculate totals
    const totals = calculateItemTotals(newItems[index])
    newItems[index].item_total_gross = totals.item_total_gross
    newItems[index].item_total_net = totals.item_total_net

    setItems(newItems)
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        product_stock_code: "",
        product_name: "",
        quantity: 1,
        unit_price: 0,
        unit_price_currency: "TRY",
        vat_rate: 18,
        item_total_gross: 0,
        item_total_net: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  // Calculate totals
  const totalAmount = items.reduce((sum, item) => sum + item.item_total_gross, 0)
  const taxAmount = items.reduce((sum, item) => sum + (item.item_total_net - item.item_total_gross), 0)
  const finalAmount = totalAmount + taxAmount - discountAmount

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      const saleData = {
        customer_mid: (formData.get("customer_mid") as string) || null,
        items: items.filter((item) => item.product_stock_code && item.quantity > 0),
        payment_method: formData.get("payment_method") as string,
        is_installment: isInstallment,
        installment_count: isInstallment ? Number(formData.get("installment_count")) : null,
        discount_amount: discountAmount,
        notes: formData.get("notes") as string,
        total_amount: totalAmount,
        tax_amount: taxAmount,
        final_amount: finalAmount,
      }

      const result = await createSaleAction(saleData)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: `Satış başarıyla oluşturuldu. Toplam: ${finalAmount.toFixed(2)} TL`,
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yeni Satış</h1>
          <p className="text-muted-foreground">Yeni bir satış işlemi oluşturun</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Müşteri Bilgileri
            </CardTitle>
            <CardDescription>Satış yapılacak müşteriyi seçin (opsiyonel)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="customer_mid">Müşteri</Label>
              <Select name="customer_mid" disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Müşteri Yok</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.mid} value={customer.mid}>
                      <div>
                        <div className="font-medium">{customer.contact_name}</div>
                        {customer.email && <div className="text-xs text-muted-foreground">{customer.email}</div>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sale Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Satış Kalemleri
                </CardTitle>
                <CardDescription>Satılacak ürünleri ekleyin</CardDescription>
              </div>
              <Button type="button" onClick={addItem} disabled={isLoading} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Kalem Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Kalem #{index + 1}</Badge>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Ürün</Label>
                    <Select
                      value={item.product_stock_code}
                      onValueChange={(value) => updateItem(index, "product_stock_code", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ürün seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.stock_code} value={product.stock_code}>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {product.stock_code} - Stok: {product.quantity_on_hand}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Miktar</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      min="1"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Birim Fiyat (TRY)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", Number(e.target.value))}
                      min="0"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>KDV Oranı (%)</Label>
                    <Input
                      type="number"
                      value={item.vat_rate}
                      onChange={(e) => updateItem(index, "vat_rate", Number(e.target.value))}
                      min="0"
                      max="100"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brüt Toplam:</span>
                    <span className="font-medium">{item.item_total_gross.toFixed(2)} TRY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KDV:</span>
                    <span className="font-medium">{(item.item_total_net - item.item_total_gross).toFixed(2)} TRY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Toplam:</span>
                    <span className="font-semibold text-primary">{item.item_total_net.toFixed(2)} TRY</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Ödeme Bilgileri
            </CardTitle>
            <CardDescription>Ödeme yöntemi ve koşullarını belirleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Ödeme Yöntemi *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="discount_amount">İndirim Tutarı (TRY)</Label>
                <Input
                  id="discount_amount"
                  name="discount_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  disabled={isLoading}
                />
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
                  defaultValue="2"
                  required={isInstallment}
                  disabled={isLoading}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notlar
            </CardTitle>
            <CardDescription>Satış ile ilgili ek notlar (opsiyonel)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Satış notları..."
              disabled={isLoading}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Satış Özeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ara Toplam:</span>
                <span>{totalAmount.toFixed(2)} TRY</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">KDV:</span>
                <span>{taxAmount.toFixed(2)} TRY</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">İndirim:</span>
                <span>-{discountAmount.toFixed(2)} TRY</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Genel Toplam:</span>
                <span className="text-primary">{finalAmount.toFixed(2)} TRY</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? "Oluşturuluyor..." : "Satış Oluştur"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/sales")} disabled={isLoading} size="lg">
            İptal
          </Button>
        </div>
      </form>
    </div>
  )
}
