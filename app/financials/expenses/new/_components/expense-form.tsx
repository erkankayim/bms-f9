"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import {
  createExpenseEntryAction,
  getFinancialCategories,
  getSuppliersForDropdown,
} from "@/app/financials/expenses/_actions/expense-actions"
import { PAYMENT_METHODS } from "@/app/financials/_lib/financial-entry-shared"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Receipt, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

type FinancialCategory = Awaited<ReturnType<typeof getFinancialCategories>>["data"] extends (infer U)[] ? U : never
type SupplierForDropdown = Awaited<ReturnType<typeof getSuppliersForDropdown>>["data"] extends (infer U)[] ? U : never

export default function ExpenseForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [state, formAction, isPending] = useActionState(createExpenseEntryAction, {
    success: false,
    message: "",
    errors: null,
  })

  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [suppliers, setSuppliers] = useState<SupplierForDropdown[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true)
      setDataError(null)
      try {
        const [catResult, suppResult] = await Promise.all([
          getFinancialCategories("expense"),
          getSuppliersForDropdown(),
        ])
        if (catResult.data) setCategories(catResult.data)
        else setDataError(catResult.error || "Kategoriler yüklenemedi")
        if (suppResult.data) setSuppliers(suppResult.data)
        else if (suppResult.error) console.warn("Tedarikçiler yüklenemedi:", suppResult.error)
      } catch (error) {
        setDataError("Veriler yüklenirken beklenmeyen bir hata oluştu")
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (state.success) {
      toast({ title: "Başarılı", description: state.message })
    } else if (state.message) {
      toast({ title: "Hata", description: state.message, variant: "destructive" })
    }
  }, [state, toast])

  const getError = (field: string) => state.errors?.[field]?.[0]

  if (loadingData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Gider Kaydı</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (dataError) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Veri Yükleme Hatası</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{dataError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Yeni Gider Kaydı
        </CardTitle>
        <CardDescription>Yeni bir gider kaydı oluşturun.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="expense_amount">Gider Tutarı (TRY) *</Label>
              <Input id="expense_amount" name="expense_amount" type="number" step="0.01" placeholder="0.00" required />
              {getError("expense_amount") && <p className="text-sm text-destructive">{getError("expense_amount")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_amount">Ödenen Tutar (TRY) *</Label>
              <Input id="payment_amount" name="payment_amount" type="number" step="0.01" placeholder="0.00" required />
              {getError("payment_amount") && <p className="text-sm text-destructive">{getError("payment_amount")}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="entry_date">Tarih *</Label>
            <Input
              id="entry_date"
              name="entry_date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            {getError("entry_date") && <p className="text-sm text-destructive">{getError("entry_date")}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category_id">Gider Kategorisi *</Label>
              <Select name="category_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Bir gider kategorisi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError("category_id") && <p className="text-sm text-destructive">{getError("category_id")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Tedarikçi (Opsiyonel)</Label>
              <Select name="supplier_id" defaultValue="no-supplier">
                <SelectTrigger>
                  <SelectValue placeholder="Bir tedarikçi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-supplier">Tedarikçi Yok</SelectItem>
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
            <Label htmlFor="expense_title">Gider Başlığı *</Label>
            <Input id="expense_title" name="expense_title" placeholder="Örn: Ofis Malzemeleri" required />
            {getError("expense_title") && <p className="text-sm text-destructive">{getError("expense_title")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense_source">Gider Kaynağı *</Label>
            <Input id="expense_source" name="expense_source" placeholder="Örn: ABC Tedarik" required />
            {getError("expense_source") && <p className="text-sm text-destructive">{getError("expense_source")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Detaylı Açıklama *</Label>
            <Input id="description" name="description" placeholder="Giderin detaylı açıklaması" required />
            {getError("description") && <p className="text-sm text-destructive">{getError("description")}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Fatura No (Opsiyonel)</Label>
              <Input id="invoice_number" name="invoice_number" placeholder="FAT-2024-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Ödeme Şekli *</Label>
              <Select name="payment_method" required>
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme şeklini seçin" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError("payment_method") && <p className="text-sm text-destructive">{getError("payment_method")}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
            <Textarea id="notes" name="notes" placeholder="Ek notlar..." />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isPending ? "Oluşturuluyor..." : "Gider Kaydı Oluştur"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
