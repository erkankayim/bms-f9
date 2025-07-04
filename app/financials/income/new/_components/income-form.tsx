"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createIncomeEntry, getCustomers } from "../../_actions/income-actions"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  mid: string
  name: string
}

export default function IncomeForm() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const data = await getCustomers()
        setCustomers(data)
      } catch (error) {
        console.error("Error fetching customers:", error)
      }
    }
    fetchCustomers()
  }, [])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await createIncomeEntry(formData)
      toast({
        title: "Başarılı",
        description: "Gelir kaydı başarıyla oluşturuldu.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni Gelir Kaydı</CardTitle>
        <CardDescription>Sisteme yeni bir gelir kaydı ekleyin</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Input id="description" name="description" placeholder="Gelir açıklaması" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incoming_amount">Tutar (₺) *</Label>
              <Input
                id="incoming_amount"
                name="incoming_amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Kaynak</Label>
              <Input id="source" name="source" placeholder="Gelir kaynağı" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_date">Tarih *</Label>
              <Input id="entry_date" name="entry_date" type="date" defaultValue={today} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Ödeme Yöntemi</Label>
              <Select name="payment_method" defaultValue="cash">
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme yöntemi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Nakit</SelectItem>
                  <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                  <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                  <SelectItem value="check">Çek</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_id">Müşteri (Opsiyonel)</Label>
              <Select name="customer_id" defaultValue="no_customer">
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_customer">Müşteri seçilmedi</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.mid} value={customer.mid}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea id="notes" name="notes" placeholder="Ek notlar..." rows={3} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : "Gelir Kaydını Oluştur"}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
