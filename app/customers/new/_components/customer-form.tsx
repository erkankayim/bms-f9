"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { createCustomerAction, updateCustomerAction } from "../_actions/customers-actions"
import { toast } from "sonner"

interface Customer {
  mid: string
  name: string
  email?: string
  phone?: string
  address?: string
  tax_number?: string
  tax_office?: string
  notes?: string
}

interface CustomerFormProps {
  initialData?: Customer
  isEditMode?: boolean
  customerId?: string
}

export function CustomerForm({ initialData, isEditMode = false, customerId }: CustomerFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    try {
      let result

      if (isEditMode && customerId) {
        console.log(`Updating customer with original ID: ${customerId}`)
        result = await updateCustomerAction(formData, customerId)
      } else {
        console.log("Creating new customer")
        result = await createCustomerAction(formData)
      }

      if (result.success) {
        toast.success(result.message)
        if (!isEditMode) {
          // Yeni müşteri oluşturulduysa formu temizle
          const form = document.getElementById("customer-form") as HTMLFormElement
          form?.reset()
        }
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (err) {
      console.error("Form submission error:", err)
      const errorMessage = "Beklenmedik bir hata oluştu."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? "Müşteri Düzenle" : "Yeni Müşteri"}</CardTitle>
        <CardDescription>
          {isEditMode ? "Müşteri bilgilerini güncelleyin" : "Yeni müşteri bilgilerini girin"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="customer-form" action={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mid">Müşteri ID *</Label>
              <Input id="mid" name="mid" defaultValue={initialData?.mid || ""} required placeholder="Örn: CUST001" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Müşteri Adı *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={initialData?.name || ""}
                required
                placeholder="Müşteri adını girin"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email || ""}
                placeholder="ornek@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" defaultValue={initialData?.phone || ""} placeholder="0555 123 45 67" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={initialData?.address || ""}
              placeholder="Müşteri adresi"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_number">Vergi Numarası</Label>
              <Input
                id="tax_number"
                name="tax_number"
                defaultValue={initialData?.tax_number || ""}
                placeholder="1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_office">Vergi Dairesi</Label>
              <Input
                id="tax_office"
                name="tax_office"
                defaultValue={initialData?.tax_office || ""}
                placeholder="Vergi dairesi adı"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={initialData?.notes || ""}
              placeholder="Müşteri hakkında notlar"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
