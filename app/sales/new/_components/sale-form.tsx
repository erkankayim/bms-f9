"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, ShoppingCart } from "lucide-react"
import { createSaleAction, getProductsForSale, getCustomersForSale } from "../_actions/sales-actions"
import { toast } from "@/hooks/use-toast"

type Product = {
  stock_code: string
  product_name: string
  sale_price: number
  current_stock: number
  tax_rate: number
}

type Customer = {
  mid: string
  contact_name: string
  email: string | null
  phone: string | null
}

type SaleItem = {
  id: string
  stock_code: string
  product_name: string
  quantity: number
  unit_price: number
  tax_rate: number
  total: number
}

export default function SaleForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<SaleItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [isInstallment, setIsInstallment] = useState(false)
  const [installmentCount, setInstallmentCount] = useState(1)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, customersData] = await Promise.all([getProductsForSale(), getCustomersForSale()])
        setProducts(productsData)
        setCustomers(customersData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Hata",
          description: "Veriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    }
    fetchData()
  }, [])

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }, [items])

  const taxAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const itemTax = (item.total * item.tax_rate) / 100
      return sum + itemTax
    }, 0)
  }, [items])

  const finalAmount = useMemo(() => {
    return totalAmount + taxAmount - discountAmount
  }, [totalAmount, taxAmount, discountAmount])

  const addItem = () => {
    const newItem: SaleItem = {
      id: Date.now().toString(),
      stock_code: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 18,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof SaleItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          if (field === "stock_code") {
            const product = products.find((p) => p.stock_code === value)
            if (product) {
              updatedItem.product_name = product.product_name
              updatedItem.unit_price = product.sale_price
              updatedItem.tax_rate = product.tax_rate
            }
          }

          if (field === "quantity" || field === "unit_price") {
            updatedItem.total = updatedItem.quantity * updatedItem.unit_price
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir ürün eklemelisiniz.",
        variant: "destructive",
      })
      return
    }

    if (items.some((item) => !item.stock_code || item.quantity <= 0)) {
      toast({
        title: "Hata",
        description: "Tüm ürünler için geçerli bilgiler giriniz.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const saleData = {
        customer_mid: selectedCustomer || null,
        total_amount: totalAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        payment_method: paymentMethod,
        is_installment: isInstallment,
        installment_count: isInstallment ? installmentCount : 1,
        notes,
        items: items.map((item) => ({
          stock_code: item.stock_code,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          total_amount: item.total,
        })),
      }

      const result = await createSaleAction(saleData)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Satış başarıyla oluşturuldu.",
        })
        router.push("/sales")
      } else {
        toast({
          title: "Hata",
          description: result.error || "Satış oluşturulurken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating sale:", error)
      toast({
        title: "Hata",
        description: "Satış oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Yeni Satış
          </CardTitle>
          <CardDescription>Yeni bir satış kaydı oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Müşteri Seçimi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Müşteri (Opsiyonel)</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_customer">Müşteri Yok</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.mid} value={customer.mid}>
                        {customer.contact_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Ödeme Yöntemi</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                    <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Taksit Seçenekleri */}
            <div className="flex items-center space-x-2">
              <Switch id="installment" checked={isInstallment} onCheckedChange={setIsInstallment} />
              <Label htmlFor="installment">Taksitli Ödeme</Label>
            </div>

            {isInstallment && (
              <div className="space-y-2">
                <Label htmlFor="installment_count">Taksit Sayısı</Label>
                <Input
                  id="installment_count"
                  type="number"
                  min="2"
                  max="12"
                  value={installmentCount}
                  onChange={(e) => setInstallmentCount(Number.parseInt(e.target.value) || 2)}
                  className="w-32"
                />
              </div>
            )}

            {/* Ürün Listesi */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Ürünler</Label>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ürün Ekle
                </Button>
              </div>

              {items.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ürün</TableHead>
                        <TableHead>Miktar</TableHead>
                        <TableHead>Birim Fiyat</TableHead>
                        <TableHead>KDV %</TableHead>
                        <TableHead>Toplam</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Select
                              value={item.stock_code}
                              onValueChange={(value) => updateItem(item.id, "stock_code", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Ürün seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.stock_code} value={product.stock_code}>
                                    {product.product_name} (Stok: {product.current_stock})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) =>
                                updateItem(item.id, "unit_price", Number.parseFloat(e.target.value) || 0)
                              }
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.tax_rate}
                              onChange={(e) => updateItem(item.id, "tax_rate", Number.parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">₺{item.total.toFixed(2)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* İndirim */}
            <div className="space-y-2">
              <Label htmlFor="discount">İndirim Tutarı</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number.parseFloat(e.target.value) || 0)}
                className="w-32"
              />
            </div>

            {/* Notlar */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Satış ile ilgili notlar..."
              />
            </div>

            {/* Özet */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Satış Özeti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ara Toplam:</span>
                    <span>₺{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>KDV:</span>
                    <span>₺{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>İndirim:</span>
                    <span>-₺{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Toplam:</span>
                    <span>₺{finalAmount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form Butonları */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting || items.length === 0}>
                {isSubmitting ? "Kaydediliyor..." : "Satışı Kaydet"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/sales")}>
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
