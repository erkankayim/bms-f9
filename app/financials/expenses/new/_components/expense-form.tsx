"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createExpenseEntry, getSuppliers } from "../../_actions/expense-actions"
import { useToast } from "@/hooks/use-toast"

interface Supplier {
  id: number
  name: string
}

export default function ExpenseForm() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const data = await getSuppliers()
        setSuppliers(data)
      } catch (error) {
        console.error("Error fetching suppliers:", error)
      }
    }
    fetchSuppliers()
  }, [])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await createExpenseEntry(formData)
      toast({
        title: "Başarılı",
        description: "Gider kaydı başarıyla oluşturuldu.",
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
        <CardTitle>Yeni Gider Kaydı</CardTitle>
        <CardDescription>Sisteme yeni bir gider kaydı ekleyin</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Input id="description" name="description" placeholder="Gider açıklaması" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outgoing_amount">Tutar (₺) *</Label>
              <Input
                id="outgoing_amount"
                name="outgoing_amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office_supplies">Ofis Malzemeleri</SelectItem>
                  <SelectItem value="utilities">Faturalar</SelectItem>
                  <SelectItem value="rent">Kira</SelectItem>
                  <SelectItem value="marketing">Pazarlama</SelectItem>
                  <SelectItem value="travel">Seyahat</SelectItem>
                  <SelectItem value="equipment">Ekipman</SelectItem>
                  <SelectItem value="maintenance">Bakım</SelectItem>
                  <SelectItem value="insurance">Sigorta</SelectItem>
                  <SelectItem value="legal">Hukuki</SelectItem>
                  <SelectItem value="consulting">Danışmanlık</SelectItem>
                  <SelectItem value="inventory">Stok Alımı</SelectItem>
                  <SelectItem value="salary">Maaş</SelectItem>
                  <SelectItem value="tax">Vergi</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="supplier_id">Tedarikçi (Opsiyonel)</Label>
              <Select name="supplier_id" defaultValue="none">
                <SelectTrigger>
                  <SelectValue placeholder="Tedarikçi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tedarikçi seçilmedi</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
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
              {isLoading ? "Kaydediliyor..." : "Gider Kaydını Oluştur"}
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
