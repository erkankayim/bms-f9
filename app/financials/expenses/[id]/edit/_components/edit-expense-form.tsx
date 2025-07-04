"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { updateExpenseEntryAction } from "../_actions/expense-actions"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Account {
  id: string
  name: string
  account_type: string
}

interface ExpenseEntry {
  id: string
  description: string
  amount: number
  category: string
  account_id: string
  entry_date: string
}

interface EditExpenseFormProps {
  expenseEntry: any
}

export function EditExpenseForm({ expenseEntry }: EditExpenseFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date(expenseEntry.entry_date))
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    expense_title: expenseEntry.expense_title || "",
    description: expenseEntry.description || "",
    expense_amount: expenseEntry.expense_amount?.toString() || "",
    payment_amount: expenseEntry.payment_amount?.toString() || "",
    expense_source: expenseEntry.expense_source || "",
    category_id: expenseEntry.category_id?.toString() || "default_category",
    supplier_id: expenseEntry.supplier_id?.toString() || "default_supplier",
    payment_method: expenseEntry.payment_method || "cash",
    invoice_number: expenseEntry.invoice_number || "",
    receipt_url: expenseEntry.receipt_url || "",
    notes: expenseEntry.notes || "",
  })

  useEffect(() => {
    // Tedarikçileri ve kategorileri yükle
    async function fetchData() {
      // Bu fonksiyonlar gerçek implementasyonda Supabase'den veri çekecek
      setSuppliers([])
      setCategories([])
    }
    fetchData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.expense_title || !formData.expense_amount) {
      toast({
        title: "Hata",
        description: "Başlık ve gider tutarı alanları zorunludur.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const updateData = {
        ...formData,
        expense_amount: Number.parseFloat(formData.expense_amount),
        payment_amount: Number.parseFloat(formData.payment_amount) || 0,
        entry_date: date.toISOString(),
      }

      const result = await updateExpenseEntryAction(expenseEntry.id, updateData)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Gider kaydı başarıyla güncellendi.",
        })
        router.push(`/financials/expenses/${expenseEntry.id}`)
      } else {
        toast({
          title: "Hata",
          description: result.error || "Gider kaydı güncellenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating expense:", error)
      toast({
        title: "Hata",
        description: "Gider kaydı güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Gider Kaydını Düzenle
          </CardTitle>
          <CardDescription>Gider kaydı bilgilerini güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense_title">Başlık *</Label>
                <Input
                  id="expense_title"
                  value={formData.expense_title}
                  onChange={(e) => handleInputChange("expense_title", e.target.value)}
                  placeholder="Gider başlığı"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_amount">Gider Tutarı *</Label>
                <Input
                  id="expense_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.expense_amount}
                  onChange={(e) => handleInputChange("expense_amount", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_amount">Ödenen Tutar</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.payment_amount}
                  onChange={(e) => handleInputChange("payment_amount", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_source">Gider Kaynağı</Label>
                <Input
                  id="expense_source"
                  value={formData.expense_source}
                  onChange={(e) => handleInputChange("expense_source", e.target.value)}
                  placeholder="Gider kaynağı"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Gider açıklaması"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tarih</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Ödeme Yöntemi</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => handleInputChange("payment_method", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                    <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                    <SelectItem value="check">Çek</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Tedarikçi</Label>
                <Select value={formData.supplier_id} onValueChange={(value) => handleInputChange("supplier_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tedarikçi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default_supplier">Tedarikçi Yok</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Kategori</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default_category">Kategori Yok</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Fatura Numarası</Label>
                <Input
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => handleInputChange("invoice_number", e.target.value)}
                  placeholder="Fatura numarası"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt_url">Fiş/Makbuz URL</Label>
                <Input
                  id="receipt_url"
                  type="url"
                  value={formData.receipt_url}
                  onChange={(e) => handleInputChange("receipt_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Ek notlar..."
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Güncelleniyor..." : "Gider Kaydını Güncelle"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/financials/expenses/${expenseEntry.id}`)}
              >
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
