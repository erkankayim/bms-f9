"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createUser, updateUser } from "../_actions/users-actions"
import Link from "next/link"

const userFormSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  fullName: z.string().min(2, { message: "Ad soyad en az 2 karakter olmalıdır" }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }).optional().or(z.literal("")),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  user?: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
    }
  }
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || "",
      fullName: user?.user_metadata?.full_name || "",
      password: "",
    },
  })

  async function onSubmit(values: UserFormValues) {
    setIsSubmitting(true)
    try {
      if (user) {
        // Mevcut kullanıcıyı güncelle
        await updateUser({
          id: user.id,
          email: values.email,
          fullName: values.fullName,
          password: values.password || undefined,
        })
        toast.success("Kullanıcı başarıyla güncellendi")
      } else {
        // Yeni kullanıcı oluştur
        if (!values.password) {
          toast.error("Yeni kullanıcı için şifre gereklidir")
          setIsSubmitting(false)
          return
        }
        await createUser({
          email: values.email,
          password: values.password,
          fullName: values.fullName,
        })
        toast.success("Kullanıcı başarıyla oluşturuldu")
      }
      router.push("/users")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input placeholder="ornek@sirket.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input placeholder="Ahmet Yılmaz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{user ? "Şifre (Değiştirmek için doldurun)" : "Şifre"}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              {user && <FormDescription>Şifreyi değiştirmek istemiyorsanız bu alanı boş bırakın.</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/users">İptal</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : user ? "Güncelle" : "Kullanıcı Oluştur"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
