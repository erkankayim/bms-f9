"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"
import { updateExpense, getFinancialCategories, getSuppliers } from "../../../_actions/expense-actions"
import { toast } from "sonner"

interface EditExpenseFormProps {
  expense: any
  expenseId: string
}

export function EditExpenseForm({ expense, expenseId }: EditExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesResult, suppliersResult] = await Promise.all([getFinancialCategories(), getSuppliers()])

        setCategories(categoriesResult.data || [])
        setSuppliers(suppliersResult.data || [])
      } catch (error) {
        console.error("Error loading form data:", error)
        toast.error("Hata", {
          description: "Form verileri yüklenirken hata oluştu.",
        })
      }
    }

    loadData()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await updateExpense(expenseId, formData)

      if (result?.error) {
        toast.error("Hata", {
          description: result.error,
        })
      } else {
        toast.success("Başarılı", {
          description: "Gider kaydı başarıyla güncellendi.",
        })
        // updateExpense fonksiyonu zaten redirect yapıyor
      }
    } catch (error) {
      toast.error("Hata", {
        description: "Gider güncellenirken beklenmeyen bir hata oluştu.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="expense_title">Gider Başlığı *</Label>
              <Input id="expense_title" name="expense_title" defaultValue={expense.expense_title} required />
            </div>
            <div>
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea id="description" name="description" defaultValue={expense.description} required />
            </div>
            <div>
              <Label htmlFor="expense_source">Gider Kaynağı</Label>
              <Input id="expense_source" name="expense_source" defaultValue={expense.expense_source} />
            </div>
            <div>
              <Label htmlFor="entry_date">Tarih *</Label>
              <Input id="entry_date" name="entry_date" type="date" defaultValue={expense.entry_date} required />
            </div>
          </CardContent>
        </Card>

        {/* Mali Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>Mali Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="expense_amount">Gider Tutarı (₺) *</Label>
              <Input
                id="expense_amount"
                name="expense_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={expense.expense_amount}
                required
              />
            </div>
            <div>
              <Label htmlFor="payment_amount">Ödenen Tutar (₺) *</Label>
              <Input
                id="payment_amount"
                name="payment_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={expense.payment_amount}
                required
              />
            </div>
            <div>
              <Label htmlFor="payment_method">Ödeme Yöntemi *</Label>
              <Select name="payment_method" defaultValue={expense.payment_method || "Nakit"}>
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme yöntemi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nakit">Nakit</SelectItem>
                  <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
                  <SelectItem value="Banka Transferi">Banka Transferi</SelectItem>
                  <SelectItem value="Çek">Çek</SelectItem>
                  <SelectItem value="Senet">Senet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Kategori ve Tedarikçi */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori ve Tedarikçi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category_id">Kategori</Label>
              <Select name="category_id" defaultValue={expense.category_id?.toString() || "0"}>
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
            <div>
              <Label htmlFor="supplier_id">Tedarikçi</Label>
              <Select name="supplier_id" defaultValue={expense.supplier_id?.toString() || "0"}>
                <SelectTrigger>
                  <SelectValue placeholder="Tedarikçi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Tedarikçi yok</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ek Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>Ek Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="invoice_number">Fatura Numarası</Label>
              <Input id="invoice_number" name="invoice_number" defaultValue={expense.invoice_number} />
            </div>
            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea id="notes" name="notes" defaultValue={expense.notes} rows={3} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Güncelleniyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Güncelle
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
