"use client"

import { useEffect, useState } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import {
  updateIncomeEntryAction,
  getFinancialCategories,
  getCustomersForDropdown,
  type FinancialCategory,
  type CustomerForDropdown,
  type IncomeEntryWithDetails,
} from "@/app/financials/_actions/financial-entries-actions"
import { PAYMENT_METHODS } from "@/app/financials/_lib/financial-entry-shared"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Users, Loader2, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EditIncomeFormProps {
  initialData: IncomeEntryWithDetails
}

export function EditIncomeForm({ initialData }: EditIncomeFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateIncomeEntryAction.bind(null, initialData.id), {
    success: false,
    message: "",
    errors: undefined,
  })

  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [customers, setCustomers] = useState<CustomerForDropdown[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true)
      setDataError(null)

      try {
        const [catResult, custResult] = await Promise.all([getFinancialCategories("income"), getCustomersForDropdown()])

        if (catResult.data) {
          setCategories(catResult.data)
        } else {
          console.error("Gelir kategorileri yüklenemedi:", catResult.error)
          setDataError(catResult.error || "Kategoriler yüklenemedi")
        }

        if (custResult.data) {
          setCustomers(custResult.data)
        } else {
          console.error("Müşteriler yüklenemedi:", custResult.error)
        }
      } catch (error) {
        console.error("Veri yükleme hatası:", error)
        setDataError("Veriler yüklenirken beklenmeyen bir hata oluştu")
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (state.success) {
      router.push(`/financials/income/${initialData.id}`)
    }
  }, [state.success, router, initialData.id])

  const getError = (field: string) => {
    if (!state.errors || !Array.isArray(state.errors)) return undefined
    return state.errors.find((e: any) => e.path && e.path[0] === field)?.message
  }

  // Find the customer MID for the current customer_id (UUID)
  const currentCustomerMid = customers.find((c) => c.id === initialData.customer_id)?.mid || ""

  if (loadingData) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gelir Kaydını Düzenle
          </CardTitle>
          <CardDescription>Mevcut gelir kaydını güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Veriler yükleniyor, lütfen bekleyin...</p>
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
          <Users className="h-5 w-5" />
          Gelir Kaydını Düzenle
        </CardTitle>
        <CardDescription>Mevcut gelir kaydını güncelleyin.</CardDescription>
      </CardHeader>
      <form action={formAction}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="incoming_amount">Gelen Tutar (TRY) *</Label>
              <Input
                id="incoming_amount"
                name="incoming_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={initialData.incoming_amount}
                required
              />
              {getError("incoming_amount") && <p className="text-sm text-destructive">{getError("incoming_amount")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry_date">Tarih *</Label>
              <Input id="entry_date" name="entry_date" type="date" defaultValue={initialData.entry_date} required />
              {getError("entry_date") && <p className="text-sm text-destructive">{getError("entry_date")}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category_id">Gelir Kategorisi *</Label>
              <Select name="category_id" defaultValue={initialData.category_id.toString()} required>
                <SelectTrigger>
                  <SelectValue placeholder="Bir gelir kategorisi seçin" />
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
              <Label htmlFor="customer_id">Müşteri (Opsiyonel)</Label>
              <Select name="customer_id" defaultValue={currentCustomerMid || "no-customer"}>
                <SelectTrigger>
                  <SelectValue placeholder="Bir müşteri seçin (varsa)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-customer">Müşteri Yok</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.mid} value={customer.mid}>
                      <div>
                        <div className="font-medium">{customer.contact_name || `Müşteri ID: ${customer.mid}`}</div>
                        {customer.email && <div className="text-xs text-muted-foreground">{customer.email}</div>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError("customer_id") && <p className="text-sm text-destructive">{getError("customer_id")}</p>}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Bu alan opsiyoneldir. Boş bırakabilirsiniz.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Gelir Kaynağı (Genel Açıklama) *</Label>
            <Input
              id="source"
              name="source"
              placeholder="Örn: Hizmet Bedeli, Ürün Satışı, Danışmanlık"
              defaultValue={initialData.source}
              required
            />
            {getError("source") && <p className="text-sm text-destructive">{getError("source")}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detaylı Açıklama *</Label>
            <Input
              id="description"
              name="description"
              placeholder="Gelirin detaylı açıklaması..."
              defaultValue={initialData.description}
              required
            />
            {getError("description") && <p className="text-sm text-destructive">{getError("description")}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Fatura No (Opsiyonel)</Label>
              <Input
                id="invoice_number"
                name="invoice_number"
                placeholder="Örn: FAT-2024-001"
                defaultValue={initialData.invoice_number || ""}
              />
              {getError("invoice_number") && <p className="text-sm text-destructive">{getError("invoice_number")}</p>}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Bu alan opsiyoneldir. Boş bırakabilirsiniz.</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Ödeme Şekli *</Label>
              <Select name="payment_method" defaultValue={initialData.payment_method} required>
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
            <Textarea
              id="notes"
              name="notes"
              placeholder="Bu gelirle ilgili ek notlar..."
              defaultValue={initialData.notes || ""}
            />
            {getError("notes") && <p className="text-sm text-destructive">{getError("notes")}</p>}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Bu alan opsiyoneldir. Boş bırakabilirsiniz.</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending} className="ml-auto">
            {isPending ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
