"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { addSupplierAction, updateSupplierAction } from "../_actions/suppliers-actions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// Zod şeması actions dosyasından alınabilir veya burada yeniden tanımlanabilir.
// Tutarlılık için actions dosyasındaki şemayı kullanmak daha iyi olabilir,
// ancak basitlik adına burada yeniden tanımlıyorum.
const supplierFormSchema = z.object({
  supplier_code: z.string().optional().nullable(),
  name: z.string().min(1, "Tedarikçi adı gereklidir."),
  contact_name: z.string().optional().nullable(),
  email: z.string().email("Geçersiz e-posta adresi.").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  tax_office: z.string().optional().nullable(),
  tax_number: z.string().optional().nullable(),
  iban: z.string().optional().nullable(),
  website: z.string().url("Geçersiz URL.").optional().or(z.literal("")).nullable(),
  notes: z.string().optional().nullable(),
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>

interface SupplierFormProps {
  initialData?: Partial<SupplierFormValues>
  isEditMode?: boolean
  supplierId?: string // Sadece edit modunda gereklidir (UUID string)
}

export function SupplierForm({ initialData, isEditMode = false, supplierId }: SupplierFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: initialData || {
      supplier_code: "",
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
      tax_office: "",
      tax_number: "",
      iban: "",
      website: "",
      notes: "",
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  async function onSubmit(data: SupplierFormValues) {
    let result
    if (isEditMode && supplierId) {
      result = await updateSupplierAction(supplierId, data)
    } else {
      result = await addSupplierAction(data)
    }

    if (result.success) {
      toast({
        title: isEditMode ? "Tedarikçi Güncellendi" : "Tedarikçi Eklendi",
        description: `Tedarikçi "${data.name}" başarıyla ${isEditMode ? "güncellendi" : "eklendi"}.`,
      })
      if (!isEditMode && result.data?.id) {
        router.push(`/suppliers/${result.data.id}`) // Yeni eklenen tedarikçinin detay sayfasına git
      } else if (isEditMode && supplierId) {
        router.push(`/suppliers/${supplierId}`) // Düzenlenen tedarikçinin detay sayfasına git
      } else {
        router.push("/suppliers")
      }
      router.refresh() // Sayfayı yenileyerek güncel listeyi veya detayı göster
    } else {
      toast({
        title: "Hata",
        description:
          result.error || `Tedarikçi ${isEditMode ? "güncellenemedi" : "eklenemedi"}. Lütfen tekrar deneyin.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tedarikçi Adı *</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: Acme Tedarik Ltd." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplier_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tedarikçi Kodu</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: SUP-001 (Opsiyonel)" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>Benzersiz bir kod atayabilirsiniz.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İletişim Kurulacak Kişi</FormLabel>
                <FormControl>
                  <Input placeholder="Ayşe Yılmaz" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="iletisim@example.com" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input placeholder="+90 555 123 4567" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Web Sitesi</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.example.com" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <Textarea placeholder="Cadde, Sokak, No..." {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şehir</FormLabel>
                <FormControl>
                  <Input placeholder="İstanbul" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İlçe / Eyalet</FormLabel>
                <FormControl>
                  <Input placeholder="Kadıköy" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posta Kodu</FormLabel>
                <FormControl>
                  <Input placeholder="34700" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ülke</FormLabel>
                <FormControl>
                  <Input placeholder="Türkiye" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tax_office"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vergi Dairesi</FormLabel>
                <FormControl>
                  <Input placeholder="Kadıköy V.D." {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tax_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vergi Numarası</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iban"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>IBAN</FormLabel>
                <FormControl>
                  <Input placeholder="TR00 0000 0000 0000 0000 0000" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea placeholder="Tedarikçiyle ilgili ek notlar..." {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? "Güncelleniyor..." : "Ekleniyor..."}
            </>
          ) : isEditMode ? (
            "Değişiklikleri Kaydet"
          ) : (
            "Tedarikçiyi Ekle"
          )}
        </Button>
      </form>
    </Form>
  )
}
