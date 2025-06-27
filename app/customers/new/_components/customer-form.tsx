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
import { addCustomerAction, updateCustomerAction } from "../_actions/customers-actions"
import { useRouter } from "next/navigation"

const customerFormSchema = z.object({
  mid: z.string().min(1, "Müşteri ID gereklidir"),
  service_name: z.string().optional(),
  contact_name: z.string().min(1, "İletişim adı gereklidir"),
  email: z.string().email("Geçersiz e-posta adresi").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  tax_office: z.string().optional(),
  tax_number: z.string().optional(),
  customer_group: z.string().optional(),
  balance: z.coerce.number().optional().default(0),
  notes: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

interface CustomerFormProps {
  initialData?: Partial<CustomerFormValues>
  isEditMode?: boolean
  customerId?: string
}

export function CustomerForm({ initialData, isEditMode = false, customerId }: CustomerFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: initialData || {
      mid: "",
      service_name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      tax_office: "",
      tax_number: "",
      customer_group: "",
      balance: 0,
      notes: "",
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  async function onSubmit(data: CustomerFormValues) {
    let result
    if (isEditMode && customerId) {
      result = await updateCustomerAction(customerId, data)
    } else {
      result = await addCustomerAction(data)
    }

    if (result.success) {
      toast({
        title: isEditMode ? "Müşteri Güncellendi" : "Müşteri Eklendi",
        description: `Müşteri ${data.contact_name} başarıyla ${isEditMode ? "güncellendi" : "eklendi"}.`,
      })
      if (!isEditMode) {
        form.reset()
      }
      router.push("/customers")
      router.refresh()
    } else {
      toast({
        title: "Hata",
        description: result.error || `Müşteri ${isEditMode ? "güncellenemedi" : "eklenemedi"}. Lütfen tekrar deneyin.`,
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
            name="mid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Müşteri ID *</FormLabel>
                <FormControl>
                  <Input placeholder="örn: MSTR-0001" {...field} readOnly={isEditMode} />
                </FormControl>
                {isEditMode && <FormDescription>Müşteri ID değiştirilemez.</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İletişim Adı *</FormLabel>
                <FormControl>
                  <Input placeholder="Ahmet Yılmaz" {...field} />
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
                  <Input type="email" placeholder="ahmet.yilmaz@ornek.com" {...field} />
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
                  <Input placeholder="+90 555 123 45 67" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="service_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hizmet/Abonelik Adı</FormLabel>
                <FormControl>
                  <Input placeholder="Premium Destek" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customer_group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Müşteri Grubu</FormLabel>
                <FormControl>
                  <Input placeholder="Perakende / Toptan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bakiye</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>Mevcut ödenmemiş bakiye.</FormDescription>
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
              <FormLabel>Sokak Adresi</FormLabel>
              <FormControl>
                <Textarea placeholder="Atatürk Cad. No:123, Merkez" {...field} />
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
                  <Input placeholder="İstanbul" {...field} />
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
                <FormLabel>İlçe/Eyalet</FormLabel>
                <FormControl>
                  <Input placeholder="Kadıköy" {...field} />
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
                  <Input placeholder="34710" {...field} />
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
                  <Input placeholder="Kadıköy Vergi Dairesi" {...field} />
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
                  <Input placeholder="1234567890" {...field} />
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
                <Textarea placeholder="Müşteri hakkında ek notlar..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? isEditMode
              ? "Müşteri Güncelleniyor..."
              : "Müşteri Ekleniyor..."
            : isEditMode
              ? "Değişiklikleri Kaydet"
              : "Müşteri Ekle"}
        </Button>
      </form>
    </Form>
  )
}
