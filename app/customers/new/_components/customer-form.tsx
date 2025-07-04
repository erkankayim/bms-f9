"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { addCustomerAction, updateCustomerAction } from "../_actions/customers-actions"
import { useToast } from "@/hooks/use-toast"

const customerFormSchema = z.object({
  mid: z.string().min(1, "Müşteri ID gereklidir"),
  service_name: z.string().optional().nullable(),
  contact_name: z.string().min(1, "İletişim adı gereklidir"),
  email: z.string().email("Geçersiz e-posta adresi").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  tax_office: z.string().optional().nullable(),
  tax_number: z.string().optional().nullable(),
  customer_group: z.string().optional().nullable(),
  balance: z.coerce.number().optional().default(0).nullable(),
  notes: z.string().optional().nullable(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

interface CustomerFormProps {
  initialData?: any
}

export function CustomerForm({ initialData }: CustomerFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!initialData

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      mid: initialData?.mid || "",
      service_name: initialData?.service_name || "",
      contact_name: initialData?.contact_name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      province: initialData?.province || "",
      postal_code: initialData?.postal_code || "",
      tax_office: initialData?.tax_office || "",
      tax_number: initialData?.tax_number || "",
      customer_group: initialData?.customer_group || "",
      balance: initialData?.balance || 0,
      notes: initialData?.notes || "",
    },
  })

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true)
    setError(null)

    try {
      let result
      if (isEditing) {
        // Use the original customer ID for updating
        result = await updateCustomerAction(initialData.mid, data)
      } else {
        result = await addCustomerAction(data)
      }

      if (result.success) {
        toast({
          title: "Başarılı",
          description: isEditing ? "Müşteri başarıyla güncellendi" : "Müşteri başarıyla eklendi",
        })

        // Navigate to the customer detail page using the final mid
        const finalMid = result.data?.mid || data.mid
        router.push(`/customers/${finalMid}`)
      } else {
        setError(result.error || "Bir hata oluştu")
      }
    } catch (err) {
      console.error("Form submission error:", err)
      setError("Beklenmedik bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
            <CardDescription>Müşterinin temel iletişim bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mid">Müşteri ID *</Label>
              <Input id="mid" {...form.register("mid")} placeholder="Örn: CUST001" disabled={loading} />
              {form.formState.errors.mid && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.mid.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contact_name">İletişim Adı *</Label>
              <Input
                id="contact_name"
                {...form.register("contact_name")}
                placeholder="Müşteri adı"
                disabled={loading}
              />
              {form.formState.errors.contact_name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.contact_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="service_name">Şirket/Servis Adı</Label>
              <Input id="service_name" {...form.register("service_name")} placeholder="Şirket adı" disabled={loading} />
            </div>

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="ornek@email.com"
                disabled={loading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" {...form.register("phone")} placeholder="0555 123 45 67" disabled={loading} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adres Bilgileri</CardTitle>
            <CardDescription>Müşterinin adres ve konum bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                {...form.register("address")}
                placeholder="Tam adres"
                disabled={loading}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="city">Şehir</Label>
              <Input id="city" {...form.register("city")} placeholder="İstanbul" disabled={loading} />
            </div>

            <div>
              <Label htmlFor="province">İl</Label>
              <Input id="province" {...form.register("province")} placeholder="Marmara" disabled={loading} />
            </div>

            <div>
              <Label htmlFor="postal_code">Posta Kodu</Label>
              <Input id="postal_code" {...form.register("postal_code")} placeholder="34000" disabled={loading} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vergi Bilgileri</CardTitle>
            <CardDescription>Faturalama için vergi bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tax_office">Vergi Dairesi</Label>
              <Input
                id="tax_office"
                {...form.register("tax_office")}
                placeholder="Kadıköy Vergi Dairesi"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="tax_number">Vergi Numarası</Label>
              <Input id="tax_number" {...form.register("tax_number")} placeholder="1234567890" disabled={loading} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diğer Bilgiler</CardTitle>
            <CardDescription>Ek müşteri bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customer_group">Müşteri Grubu</Label>
              <Input
                id="customer_group"
                {...form.register("customer_group")}
                placeholder="VIP, Standart, vs."
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="balance">Bakiye</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                {...form.register("balance")}
                placeholder="0.00"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Müşteri hakkında notlar..."
                disabled={loading}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  )
}
