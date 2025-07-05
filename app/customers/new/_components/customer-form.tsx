"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { createCustomer, updateCustomer } from "../_actions/customers-actions"

// Enhanced validation schema with Turkish error messages
const customerSchema = z.object({
  mid: z
    .string()
    .min(1, "Müşteri ID zorunludur")
    .max(50, "Müşteri ID en fazla 50 karakter olabilir")
    .regex(/^[a-zA-Z0-9_-]+$/, "Müşteri ID sadece harf, rakam, tire ve alt çizgi içerebilir"),
  contact_name: z
    .string()
    .min(2, "İletişim adı en az 2 karakter olmalıdır")
    .max(100, "İletişim adı en fazla 100 karakter olabilir"),
  company_name: z.string().max(100, "Şirket adı en fazla 100 karakter olabilir").optional(),
  email: z
    .string()
    .email("Geçerli bir email adresi giriniz")
    .max(100, "Email adresi en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(20, "Telefon numarası en fazla 20 karakter olabilir")
    .regex(/^[0-9+\-\s()]*$/, "Geçerli bir telefon numarası giriniz")
    .optional()
    .or(z.literal("")),
  address: z.string().max(500, "Adres en fazla 500 karakter olabilir").optional().or(z.literal("")),
  city: z.string().max(50, "Şehir adı en fazla 50 karakter olabilir").optional().or(z.literal("")),
  province: z.string().max(50, "İl adı en fazla 50 karakter olabilir").optional().or(z.literal("")),
  postal_code: z
    .string()
    .max(10, "Posta kodu en fazla 10 karakter olabilir")
    .regex(/^[0-9]*$/, "Posta kodu sadece rakam içerebilir")
    .optional()
    .or(z.literal("")),
  country: z.string().max(50, "Ülke adı en fazla 50 karakter olabilir").optional().or(z.literal("")),
  tax_number: z
    .string()
    .max(20, "Vergi numarası en fazla 20 karakter olabilir")
    .regex(/^[0-9]*$/, "Vergi numarası sadece rakam içerebilir")
    .optional()
    .or(z.literal("")),
  customer_group: z.string().max(50, "Müşteri grubu en fazla 50 karakter olabilir").optional().or(z.literal("")),
  balance: z
    .number()
    .min(-999999.99, "Bakiye en az -999,999.99 olabilir")
    .max(999999.99, "Bakiye en fazla 999,999.99 olabilir")
    .optional(),
  notes: z.string().max(1000, "Notlar en fazla 1000 karakter olabilir").optional().or(z.literal("")),
  service_name: z.string().max(100, "Hizmet adı en fazla 100 karakter olabilir").optional().or(z.literal("")),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>
  isEditing?: boolean
}

export default function CustomerForm({ initialData, isEditing = false }: CustomerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      mid: initialData?.mid || "",
      contact_name: initialData?.contact_name || "",
      company_name: initialData?.company_name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      province: initialData?.province || "",
      postal_code: initialData?.postal_code || "",
      country: initialData?.country || "",
      tax_number: initialData?.tax_number || "",
      customer_group: initialData?.customer_group || "",
      balance: initialData?.balance || 0,
      notes: initialData?.notes || "",
      service_name: initialData?.service_name || "",
    },
  })

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Convert empty strings to null for optional fields
      const processedData = {
        ...data,
        company_name: data.company_name || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        province: data.province || null,
        postal_code: data.postal_code || null,
        country: data.country || null,
        tax_number: data.tax_number || null,
        customer_group: data.customer_group || null,
        notes: data.notes || null,
        service_name: data.service_name || null,
      }

      if (isEditing && initialData?.mid) {
        await updateCustomer(initialData.mid, processedData)
      } else {
        await createCustomer(processedData)
      }

      router.push("/customers")
      router.refresh()
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitError(
        error instanceof Error ? error.message : "Müşteri kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const FormField = ({
    name,
    label,
    type = "text",
    required = false,
    ...props
  }: {
    name: keyof CustomerFormData
    label: string
    type?: string
    required?: boolean
    placeholder?: string
    rows?: number
  }) => {
    const error = errors[name]
    const hasError = !!error

    return (
      <div className="space-y-2">
        <Label htmlFor={name} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
          {label}
        </Label>
        {type === "textarea" ? (
          <Textarea
            id={name}
            {...register(name)}
            className={hasError ? "border-red-500 focus:border-red-500" : ""}
            {...props}
          />
        ) : type === "number" ? (
          <Input
            id={name}
            type="number"
            step="0.01"
            {...register(name, { valueAsNumber: true })}
            className={hasError ? "border-red-500 focus:border-red-500" : ""}
            {...props}
          />
        ) : (
          <Input
            id={name}
            type={type}
            {...register(name)}
            className={hasError ? "border-red-500 focus:border-red-500" : ""}
            {...props}
          />
        )}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditing ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Müşteri bilgilerini güncelleyin. Zorunlu alanlar * ile işaretlenmiştir."
              : "Yeni müşteri bilgilerini girin. Zorunlu alanlar * ile işaretlenmiştir."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Temel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="mid" label="Müşteri ID" required placeholder="Örn: CUST001" />
                <FormField name="contact_name" label="İletişim Adı" required placeholder="Örn: Ahmet Yılmaz" />
                <FormField name="company_name" label="Şirket Adı" placeholder="Örn: ABC Şirketi" />
                <FormField name="customer_group" label="Müşteri Grubu" placeholder="Örn: VIP, Standart" />
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">İletişim Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="email" label="Email" type="email" placeholder="ornek@email.com" />
                <FormField name="phone" label="Telefon" placeholder="0532 123 45 67" />
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Adres Bilgileri</h3>
              <div className="space-y-4">
                <FormField name="address" label="Adres" type="textarea" rows={3} placeholder="Tam adres bilgisi" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField name="city" label="Şehir" placeholder="İstanbul" />
                  <FormField name="province" label="İl/Eyalet" placeholder="Marmara" />
                  <FormField name="postal_code" label="Posta Kodu" placeholder="34000" />
                </div>
                <FormField name="country" label="Ülke" placeholder="Türkiye" />
              </div>
            </div>

            {/* Mali Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mali Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="tax_number" label="Vergi Numarası" placeholder="1234567890" />
                <FormField name="balance" label="Bakiye (₺)" type="number" placeholder="0.00" />
              </div>
            </div>

            {/* Diğer Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Diğer Bilgiler</h3>
              <FormField name="service_name" label="Hizmet/Abonelik" placeholder="Örn: Premium Paket" />
              <FormField
                name="notes"
                label="Notlar"
                type="textarea"
                rows={4}
                placeholder="Müşteri hakkında ek notlar..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting || !isValid} className="min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : isEditing ? (
                  "Güncelle"
                ) : (
                  "Kaydet"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
