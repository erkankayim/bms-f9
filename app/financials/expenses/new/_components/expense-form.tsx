"use client"

import { useEffect, useState } from "react"
import { useActionState } from "react"
import {
  createExpenseEntryAction,
  getFinancialCategories,
  getSuppliersForDropdown,
  type FinancialCategory,
  type SupplierForDropdown,
} from "@/app/financials/_actions/financial-entries-actions"
import { PAYMENT_METHODS } from "@/app/financials/_lib/financial-entry-shared"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Receipt, Loader2, Info, Building2, User, Phone, Mail } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const initialState = {
  success: false,
  message: "",
  errors: undefined,
}

export default function ExpenseForm() {
  const [state, formAction, isPending] = useActionState(createExpenseEntryAction, initialState)
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [suppliers, setSuppliers] = useState<SupplierForDropdown[]>([])
  const [formKey, setFormKey] = useState(Date.now())
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true)
      setDataError(null)

      try {
        console.log("🚀 Starting to fetch categories and suppliers...")

        const [catResult, suppResult] = await Promise.all([
          getFinancialCategories("expense").catch((err) => {
            console.error("❌ Category fetch error:", err)
            return { error: err.message }
          }),
          getSuppliersForDropdown().catch((err) => {
            console.error("❌ Supplier fetch error:", err)
            return { error: err.message }
          }),
        ])

        console.log("📊 Category result:", catResult)
        console.log("📊 Supplier result:", suppResult)

        if (catResult.data) {
          setCategories(catResult.data)
          console.log(`✅ Loaded ${catResult.data.length} categories`)
        } else {
          console.error("❌ Gider kategorileri yüklenemedi:", catResult.error)
          setDataError(catResult.error || "Kategoriler yüklenemedi")
        }

        if (suppResult.data) {
          setSuppliers(suppResult.data)
          console.log(`✅ Loaded ${suppResult.data.length} suppliers:`, suppResult.data)
        } else {
          console.error("❌ Tedarikçiler yüklenemedi:", suppResult.error)
          console.warn("⚠️ Tedarikçiler yüklenemedi, boş liste kullanılacak")
          setSuppliers([])
        }
      } catch (error) {
        console.error("💥 Veri yükleme hatası:", error)
        setDataError("Veriler yüklenirken beklenmeyen bir hata oluştu")
      } finally {
        setLoadingData(false)
        console.log("🏁 Data fetching completed")
      }
    }

    fetchData()
  }, [])

  // Form sadece başarılı olduğunda sıfırlansın
  useEffect(() => {
    if (state.success) {
      setFormKey(Date.now())
    }
  }, [state.success])

  const getError = (field: string) => {
    if (!state.errors || !Array.isArray(state.errors)) return undefined
    return state.errors.find((e: any) => e.path && e.path[0] === field)?.message
  }

  if (loadingData) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Yeni Gider Kaydı
          </CardTitle>
          <CardDescription>
            İşletme giderlerinizi detaylı olarak kaydedin ve tedarikçi ile ilişkilendirin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Veriler yükleniyor, lütfen bekleyin...</p>
            <p className="text-sm text-muted-foreground mt-2">Kategoriler ve tedarikçiler getiriliyor...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (dataError) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Veri Yükleme Hatası
          </CardTitle>
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
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Yeni Gider Kaydı
        </CardTitle>
        <CardDescription>
          İşletme giderlerinizi detaylı olarak kaydedin ve tedarikçi ile ilişkilendirin.
        </CardDescription>
      </CardHeader>
      <form action={formAction} key={formKey}>
        <CardContent className="space-y-6">
          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription>
                {state.message}
                {state.errors && state.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Lütfen aşağıdaki alanları kontrol edin:</p>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {state.errors.map((error: any, index: number) => (
                        <li key={index}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          {state.success && state.message && (
            <Alert
              variant="default"
              className="border-green-200 bg-green-50 dark:bg-green-900/30 dark:border-green-700"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">Başarılı</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">{state.message}</AlertDescription>
            </Alert>
          )}

          {/* Debug Info - Geliştirme aşamasında görmek için */}
          <div className="bg-muted/50 p-3 rounded-lg text-xs">
            <p>🔍 Debug: {suppliers.length} tedarikçi yüklendi</p>
            <p>📊 Kategoriler: {categories.length} adet</p>
          </div>

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
              defaultValue={new Date().toISOString().split("T")[0]}
              required
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
                  {categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      Kategori bulunamadı
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.description && (
                            <div className="text-xs text-muted-foreground">{category.description}</div>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {getError("category_id") && <p className="text-sm text-destructive">{getError("category_id")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Tedarikçi (Opsiyonel)</Label>
              <Select name="supplier_id">
                <SelectTrigger>
                  <SelectValue placeholder="Bir tedarikçi seçin (varsa)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-supplier">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Tedarikçi Yok</span>
                    </div>
                  </SelectItem>
                  {suppliers.length === 0 ? (
                    <SelectItem value="no-suppliers-available" disabled>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>Henüz tedarikçi eklenmemiş</span>
                      </div>
                    </SelectItem>
                  ) : (
                    suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        <div className="flex items-start gap-3 py-1">
                          <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {supplier.name || supplier.company_name || "İsimsiz Tedarikçi"}
                            </div>
                            {supplier.contact_name && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {supplier.contact_name}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {supplier.phone}
                              </div>
                            )}
                            {supplier.email && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {supplier.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {getError("supplier_id") && <p className="text-sm text-destructive">{getError("supplier_id")}</p>}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Bu alan opsiyoneldir. Tedarikçi yoksa "Tedarikçi Yok" seçin.</span>
              </div>
              {suppliers.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>Henüz sistemde tedarikçi bulunmuyor. Önce tedarikçi ekleyebilirsiniz.</span>
                </div>
              )}
              {suppliers.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{suppliers.length} tedarikçi bulundu ve listelendi.</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_title">Gider Başlığı *</Label>
            <Input id="expense_title" name="expense_title" placeholder="Örn: Ofis Kirası, Elektrik Faturası" required />
            {getError("expense_title") && <p className="text-sm text-destructive">{getError("expense_title")}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_source">Gider Kaynağı *</Label>
            <Input id="expense_source" name="expense_source" placeholder="Örn: ABC Şirketi, XYZ Market" required />
            {getError("expense_source") && <p className="text-sm text-destructive">{getError("expense_source")}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detaylı Açıklama *</Label>
            <Input id="description" name="description" placeholder="Giderin detaylı açıklaması..." required />
            {getError("description") && <p className="text-sm text-destructive">{getError("description")}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Fatura No (Opsiyonel)</Label>
              <Input id="invoice_number" name="invoice_number" placeholder="Örn: FAT-2024-001" />
              {getError("invoice_number") && <p className="text-sm text-destructive">{getError("invoice_number")}</p>}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Bu alan opsiyoneldir. Boş bırakabilirsiniz.</span>
              </div>
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
            <Textarea id="notes" name="notes" placeholder="Bu giderle ilgili ek notlar..." />
            {getError("notes") && <p className="text-sm text-destructive">{getError("notes")}</p>}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Bu alan opsiyoneldir. Boş bırakabilirsiniz.</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending} className="ml-auto">
            {isPending ? "Kaydediliyor..." : "Gider Kaydet"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
