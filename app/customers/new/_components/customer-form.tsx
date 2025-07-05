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
  mid: z
    .string()
    .min(1, "Müşteri ID gereklidir")
    .max(50, "Müşteri ID en fazla 50 karakter olabilir")
    .regex(/^[A-Za-z0-9_-]+$/, "Müşteri ID sadece harf, rakam, tire ve alt çizgi içerebilir"),
  service_name: z.string().max(100, "Şirket/Servis adı en fazla 100 karakter olabilir").optional().nullable(),
  contact_name: z
    .string()
    .min(1, "İletişim adı gereklidir")
    .min(2, "İletişim adı en az 2 karakter olmalıdır")
    .max(100, "İletişim adı en fazla 100 karakter olabilir"),
  email: z
    .string()
    .email("Geçersiz e-posta adresi formatı")
    .max(100, "E-posta adresi en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal(""))
    .nullable(),
  phone: z
    .string()
    .max(20, "Telefon numarası en fazla 20 karakter olabilir")
    .regex(/^[0-9\s\-+$$$$]*$/, "Telefon numarası sadece rakam ve telefon karakterleri içerebilir")
    .optional()
    .nullable(),
  address: z.string().max(500, "Adres en fazla 500 karakter olabilir").optional().nullable(),
  city: z.string().max(50, "Şehir adı en fazla 50 karakter olabilir").optional().nullable(),
  province: z.string().max(50, "İl adı en fazla 50 karakter olabilir").optional().nullable(),
  postal_code: z
    .string()
    .max(10, "Posta kodu en fazla 10 karakter olabilir")
    .regex(/^[0-9]*$/, "Posta kodu sadece rakam içerebilir")
    .optional()
    .nullable(),
  tax_office: z.string().max(100, "Vergi dairesi adı en fazla 100 karakter olabilir").optional().nullable(),
  tax_number: z
    .string()
    .max(20, "Vergi numarası en fazla 20 karakter olabilir")
    .regex(/^[0-9]*$/, "Vergi numarası sadece rakam içerebilir")
    .optional()
    .nullable(),
  customer_group: z.string().max(50, "Müşteri grubu en fazla 50 karakter olabilir").optional().nullable(),
  balance: z.coerce
    .number()
    .min(-999999.99, "Bakiye çok düşük")
    .max(999999.99, "Bakiye çok yüksek")
    .optional()
    .default(0)
    .nullable(),
  notes: z.string().max(1000, "Notlar en fazla 1000 karakter olabilir").optional().nullable(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

interface CustomerFormProps {
  initialData?: any
  isEditMode?: boolean
  customerId?: string
}

export function CustomerForm({ initialData, isEditMode = false, customerId }: CustomerFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    mode: "onChange", // Enable real-time validation
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
      if (isEditMode && customerId) {
        // Use the original customer ID for updating
        result = await updateCustomerAction(customerId, data)
      } else {
        result = await addCustomerAction(data)
      }

      if (result.success) {
        toast({
          title: "Başarılı",
          description: isEditMode ? "Müşteri başarıyla güncellendi" : "Müşteri başarıyla eklendi",
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
              <Input
                id="mid"
                {...form.register("mid")}
                placeholder="Örn: CUST001"
                disabled={loading}
                className={form.formState.errors.mid ? "border-red-500" : ""}
              />
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
                className={form.formState.errors.contact_name ? "border-red-500" : ""}
              />
              {form.formState.errors.contact_name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.contact_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="service_name">Şirket/Servis Adı</Label>
              <Input
                id="service_name"
                {...form.register("service_name")}
                placeholder="Şirket adı"
                disabled={loading}
                className={form.formState.errors.service_name ? "border-red-500" : ""}
              />
              {form.formState.errors.service_name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.service_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="ornek@email.com"
                disabled={loading}
                className={form.formState.errors.email ? "border-red-500" : ""}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="0555 123 45 67"
                disabled={loading}
                className={form.formState.errors.phone ? "border-red-500" : ""}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
              )}
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
                className={form.formState.errors.address ? "border-red-500" : ""}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">Şehir</Label>
              <Input
                id="city"
                {...form.register("city")}
                placeholder="İstanbul"
                disabled={loading}
                className={form.formState.errors.city ? "border-red-500" : ""}
              />
              {form.formState.errors.city && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="province">İl</Label>
              <Input
                id="province"
                {...form.register("province")}
                placeholder="Marmara"
                disabled={loading}
                className={form.formState.errors.province ? "border-red-500" : ""}
              />
              {form.formState.errors.province && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.province.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="postal_code">Posta Kodu</Label>
              <Input
                id="postal_code"
                {...form.register("postal_code")}
                placeholder="34000"
                disabled={loading}
                className={form.formState.errors.postal_code ? "border-red-500" : ""}
              />
              {form.formState.errors.postal_code && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.postal_code.message}</p>
              )}
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
                className={form.formState.errors.tax_office ? "border-red-500" : ""}
              />
              {form.formState.errors.tax_office && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.tax_office.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tax_number">Vergi Numarası</Label>
              <Input
                id="tax_number"
                {...form.register("tax_number")}
                placeholder="1234567890"
                disabled={loading}
                className={form.formState.errors.tax_number ? "border-red-500" : ""}
              />
              {form.formState.errors.tax_number && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.tax_number.message}</p>
              )}
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
                className={form.formState.errors.customer_group ? "border-red-500" : ""}
              />
              {form.formState.errors.customer_group && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.customer_group.message}</p>
              )}
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
                className={form.formState.errors.balance ? "border-red-500" : ""}
              />
              {form.formState.errors.balance && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.balance.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Müşteri hakkında notlar..."
                disabled={loading}
                rows={3}
                className={form.formState.errors.notes ? "border-red-500" : ""}
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.notes.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          İptal
        </Button>
        <Button
          type="submit"
          disabled={loading || !form.formState.isValid}
          className={!form.formState.isValid ? "opacity-50" : ""}
        >
          {loading ? "Kaydediliyor..." : isEditMode ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  )
}
