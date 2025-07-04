"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { addCustomerAction, updateCustomerAction } from "../_actions/customers-actions"
import { useToast } from "@/components/ui/use-toast"

interface CustomerFormProps {
  customer?: any
  isEditing?: boolean
}

export function CustomerForm({ customer, isEditing = false }: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      const customerData = {
        mid: formData.get("mid") as string,
        service_name: formData.get("service_name") as string,
        contact_name: formData.get("contact_name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        province: formData.get("province") as string,
        postal_code: formData.get("postal_code") as string,
        tax_office: formData.get("tax_office") as string,
        tax_number: formData.get("tax_number") as string,
        customer_group: formData.get("customer_group") as string,
        balance: Number(formData.get("balance") as string) || 0,
        notes: formData.get("notes") as string,
      }

      let result
      if (isEditing && customer) {
        result = await updateCustomerAction(customer.mid, customerData)
      } else {
        result = await addCustomerAction(customerData)
      }

      if (result.success) {
        toast({
          title: "Başarılı",
          description: isEditing
            ? `${customerData.contact_name} adlı müşteri başarıyla güncellendi`
            : `${customerData.contact_name} adlı müşteri başarıyla eklendi`,
          variant: "default",
        })
        router.push("/customers")
      } else if (result.error) {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Müşteri Düzenle" : "Yeni Müşteri"}</CardTitle>
        <CardDescription>{isEditing ? "Müşteri bilgilerini güncelleyin" : "Yeni bir müşteri ekleyin"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mid">Müşteri ID *</Label>
              <Input
                id="mid"
                name="mid"
                defaultValue={customer?.mid || ""}
                required
                disabled={isLoading || isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_name">Firma Adı</Label>
              <Input
                id="service_name"
                name="service_name"
                defaultValue={customer?.service_name || ""}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">İletişim Adı *</Label>
              <Input
                id="contact_name"
                name="contact_name"
                defaultValue={customer?.contact_name || ""}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" defaultValue={customer?.email || ""} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" defaultValue={customer?.phone || ""} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_group">Müşteri Grubu</Label>
              <Input
                id="customer_group"
                name="customer_group"
                defaultValue={customer?.customer_group || ""}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <Input id="city" name="city" defaultValue={customer?.city || ""} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">İl</Label>
              <Input id="province" name="province" defaultValue={customer?.province || ""} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Posta Kodu</Label>
              <Input
                id="postal_code"
                name="postal_code"
                defaultValue={customer?.postal_code || ""}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_office">Vergi Dairesi</Label>
              <Input id="tax_office" name="tax_office" defaultValue={customer?.tax_office || ""} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_number">Vergi Numarası</Label>
              <Input id="tax_number" name="tax_number" defaultValue={customer?.tax_number || ""} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Bakiye</Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                step="0.01"
                defaultValue={customer?.balance || 0}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Textarea id="address" name="address" defaultValue={customer?.address || ""} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea id="notes" name="notes" defaultValue={customer?.notes || ""} disabled={isLoading} />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Ekle"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/customers")} disabled={isLoading}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
