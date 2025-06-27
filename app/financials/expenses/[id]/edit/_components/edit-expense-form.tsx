"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  updateExpenseEntryAction,
  getFinancialCategories,
  getSuppliersForDropdown,
  type ExpenseEntryWithDetails,
  type FinancialCategory,
  type SupplierForDropdown,
} from "../../../../_actions/financial-entries-actions"

const PAYMENT_METHODS = ["Nakit", "Kredi Kartı", "Banka Kartı", "Havale/EFT", "Çek", "Senet", "Diğer"]

interface EditExpenseFormProps {
  expense: ExpenseEntryWithDetails
}

export function EditExpenseForm({ expense }: EditExpenseFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [suppliers, setSuppliers] = useState<SupplierForDropdown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await updateExpenseEntryAction(expense.id, prevState, formData)
      if (result.success) {
        toast.success(result.message)
        router.push(`/financials/expenses/${expense.id}`)
      } else {
        toast.error(result.message)
      }
      return result
    },
    { success: false, message: "", errors: undefined },
  )

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        const [categoriesResult, suppliersResult] = await Promise.all([
          getFinancialCategories("expense"),
          getSuppliersForDropdown(),
        ])

        if (categoriesResult.error) {
          setError(categoriesResult.error)
          return
        }

        if (suppliersResult.error) {
          setError(suppliersResult.error)
          return
        }

        setCategories(categoriesResult.data || [])
        setSuppliers(suppliersResult.data || [])
      } catch (err) {
        setError("Veri yüklenirken beklenmeyen bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Yükleniyor...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>Veri Yükleme Hatası</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Link href={`/financials/expenses/${expense.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Button>
          </Link>
          <div>
            <CardTitle>Gider Düzenle</CardTitle>
            <CardDescription>
              #{expense.id} - {expense.expense_title}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense_title">Gider Başlığı *</Label>
              <Input
                id="expense_title"
                name="expense_title"
                defaultValue={expense.expense_title}
                placeholder="Gider başlığını girin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_source">Gider Kaynağı *</Label>
              <Input
                id="expense_source"
                name="expense_source"
                defaultValue={expense.expense_source}
                placeholder="Gider kaynağını girin"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={expense.description}
              placeholder="Gider açıklamasını girin"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_date">Tarih *</Label>
              <Input id="entry_date" name="entry_date" type="date" defaultValue={expense.entry_date} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Kategori *</Label>
              <Select name="category_id" defaultValue={expense.category_id.toString()} required>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Tedarikçi</Label>
              <Select name="supplier_id" defaultValue={expense.supplier_id?.toString() || "none"}>
                <SelectTrigger>
                  <SelectValue placeholder="Tedarikçi seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tedarikçi Yok</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Ödeme Şekli *</Label>
              <Select name="payment_method" defaultValue={expense.payment_method} required>
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme şekli seçin" />
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Fatura Numarası</Label>
              <Input
                id="invoice_number"
                name="invoice_number"
                defaultValue={expense.invoice_number || ""}
                placeholder="Fatura numarasını girin (opsiyonel)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_url">Fiş/Makbuz URL</Label>
              <Input
                id="receipt_url"
                name="receipt_url"
                type="url"
                defaultValue={expense.receipt_url || ""}
                placeholder="https://example.com/receipt.pdf"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={expense.notes || ""}
              placeholder="Ek notlar (opsiyonel)"
              rows={3}
            />
          </div>

          {state.errors && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                <p className="font-medium">Aşağıdaki hataları düzeltin:</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {state.errors.map((error: any, index: number) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Link href={`/financials/expenses/${expense.id}`}>
              <Button type="button" variant="outline">
                İptal
              </Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
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
      </CardContent>
    </Card>
  )
}
