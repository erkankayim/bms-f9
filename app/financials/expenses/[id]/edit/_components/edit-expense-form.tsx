"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Save, Loader2 } from "lucide-react"
import { updateExpense, getFinancialCategories, getSuppliers } from "../../_actions/expense-actions"
import { toast } from "sonner"
import { PAYMENT_METHODS } from "@/app/financials/_lib/financial-entry-shared"

interface EditExpenseFormProps {
  expense: any
  expenseId: string
}

export function EditExpenseForm({ expense, expenseId }: EditExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesResult, suppliersResult] = await Promise.all([getFinancialCategories(), getSuppliers()])

        if (categoriesResult.data) {
          setCategories(categoriesResult.data)
        }
        if (suppliersResult.data) {
          setSuppliers(suppliersResult.data)
        }
      } catch (error) {
        toast.error("Veri yüklenirken hata oluştu")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
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
      }
    } catch (error) {
      toast.error("Hata", {
        description: "Gider güncellenirken beklenmeyen bir hata oluştu.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
            <CardDescription>Giderin temel bilgilerini girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense_title">Gider Başlığı *</Label>
              <Input
                id="expense_title"
                name="expense_title"
                defaultValue={expense.expense_title}
                placeholder="Örn: Ofis Kira Gideri"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={expense.description}
                placeholder="Gider hakkında detaylı açıklama"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_source">Gider Kaynağı *</Label>
              <Input
                id="expense_source"
                name="expense_source"
                defaultValue={expense.expense_source}
                placeholder="Örn: Ofis Giderleri"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_date">Tarih *</Label>
              <Input id="entry_date" name="entry_date" type="date" defaultValue={expense.entry_date} required />
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mali Bilgiler</CardTitle>
            <CardDescription>Tutar ve ödeme bilgilerini girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense_amount">Gider Tutarı (₺) *</Label>
              <Input
                id="expense_amount"
                name="expense_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={expense.expense_amount}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_amount">Ödenen Tutar (₺) *</Label>
              <Input
                id="payment_amount"
                name="payment_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={expense.payment_amount}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Ödeme Yöntemi *</Label>
              <Select name="payment_method" defaultValue={expense.payment_method || "N/A"} required>
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme yöntemi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_number">Fatura Numarası</Label>
              <Input
                id="invoice_number"
                name="invoice_number"
                defaultValue={expense.invoice_number || ""}
                placeholder="Fatura numarası (opsiyonel)"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category and Supplier */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kategori ve Tedarikçi</CardTitle>
          <CardDescription>Giderin kategorisini ve tedarikçisini seçin</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category_id">Kategori *</Label>
            <Select name="category_id" defaultValue={expense.category_id?.toString() || "0"} required>
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

          <div className="space-y-2">
            <Label htmlFor="supplier_id">Tedarikçi</Label>
            <Select name="supplier_id" defaultValue={expense.supplier_id || "0"}>
              <SelectTrigger>
                <SelectValue placeholder="Tedarikçi seçin (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tedarikçi seçilmedi</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
          <CardDescription>İsteğe bağlı ek bilgiler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={expense.notes || ""}
              placeholder="Gider hakkında ek notlar (opsiyonel)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Güncelleniyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Değişiklikleri Kaydet
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
