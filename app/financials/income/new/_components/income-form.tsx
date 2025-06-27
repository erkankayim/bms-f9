"use client"

import { useEffect, useState } from "react"
import { useActionState } from "react"
import {
  createIncomeEntryAction,
  getFinancialCategories,
  getCustomersForDropdown,
  type FinancialCategory,
  type CustomerForDropdown,
} from "@/app/financials/_actions/financial-entries-actions"
import { PAYMENT_METHODS } from "@/app/financials/_lib/financial-entry-shared"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Users, Loader2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

const initialState = {
  success: false,
  message: "",
  errors: undefined,
}

export default function IncomeForm() {
  const { toast } = useToast()
  const [state, formAction, isPending] = useActionState(createIncomeEntryAction, initialState)
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [customers, setCustomers] = useState<CustomerForDropdown[]>([])
  const [formKey, setFormKey] = useState(Date.now())
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoadingData(true)
    setDataError(null)
    try {
      const [catResult, custResult] = await Promise.all([getFinancialCategories("income"), getCustomersForDropdown()])

      if (catResult.error) throw new Error(catResult.error)
      setCategories(catResult.data || [])

      if (custResult.error) throw new Error(custResult.error)
      setCustomers(custResult.data || [])
    } catch (error) {
      setDataError(error.message || "Veriler yüklenirken bir hata oluştu.")
      console.error("Data fetching error:", error)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Başarılı" : "Hata",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
      if (state.success) {
        setFormKey(Date.now()) // Reset form on success
      }
    }
  }, [state, toast])

  const getError = (field: string) => {
    return state.errors?.find((e: any) => e.path[0] === field)?.message
  }

  if (loadingData) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Yeni Gelir Kaydı</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Veriler yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (dataError) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-destructive">Veri Yükleme Hatası</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{dataError}</AlertDescription>
          </Alert>
          <Button onClick={fetchData} variant="outline" className="w-full bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Yeni Gelir Kaydı
        </CardTitle>
        <CardDescription>İşletme gelirlerinizi detaylı olarak kaydedin.</CardDescription>
      </CardHeader>
      <form action={formAction} key={formKey}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="incoming_amount">Gelen Tutar (TRY) *</Label>
              <Input
                id="incoming_amount"
                name="incoming_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
              {getError("incoming_amount") && <p className="text-sm text-destructive">{getError("incoming_amount")}</p>}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category_id">Gelir Kategorisi *</Label>
              <Select name="category_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Bir kategori seçin" />
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
              <Label htmlFor="customer_id">Müşteri (Opsiyonel)</Label>
              <Select name="customer_id">
                <SelectTrigger>
                  <SelectValue placeholder="Bir müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Müşteri Yok</SelectItem>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <SelectItem key={customer.mid} value={customer.mid}>
                        {customer.contact_name} ({customer.mid})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-customers" disabled>
                      Müşteri bulunamadı
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {getError("customer_id") && <p className="text-sm text-destructive">{getError("customer_id")}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Kaynak *</Label>
            <Input id="source" name="source" placeholder="Örn: Banka, Elden" required />
            {getError("source") && <p className="text-sm text-destructive">{getError("source")}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea id="description" name="description" placeholder="Gelirin detaylı açıklaması..." required />
            {getError("description") && <p className="text-sm text-destructive">{getError("description")}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Fatura No (Opsiyonel)</Label>
              <Input id="invoice_number" name="invoice_number" placeholder="FAT-2024-001" />
              {getError("invoice_number") && <p className="text-sm text-destructive">{getError("invoice_number")}</p>}
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
            <Textarea id="notes" name="notes" placeholder="Bu gelirle ilgili ek notlar..." />
            {getError("notes") && <p className="text-sm text-destructive">{getError("notes")}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending} className="ml-auto">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Kaydediliyor..." : "Gelir Kaydet"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
