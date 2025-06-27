"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "E-posta ve şifre gereklidir" }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error:", error)
      return { error: "Geçersiz e-posta veya şifre" }
    }

    // Revalidate and redirect
    revalidatePath("/", "layout")
    redirect("/")
  } catch (error) {
    console.error("Unexpected login error:", error)
    return { error: "Giriş yapılırken bir hata oluştu" }
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !password || !confirmPassword) {
    return { error: "Tüm alanlar gereklidir" }
  }

  if (password !== confirmPassword) {
    return { error: "Şifreler eşleşmiyor" }
  }

  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır" }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error("Register error:", error)
      return { error: "Kayıt olurken bir hata oluştu" }
    }

    revalidatePath("/", "layout")
    redirect("/auth/login?message=Kayıt başarılı! Giriş yapabilirsiniz.")
  } catch (error) {
    console.error("Unexpected register error:", error)
    return { error: "Kayıt olurken bir hata oluştu" }
  }
}

export async function logoutAction() {
  const supabase = createClient()

  try {
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/auth/login")
  } catch (error) {
    console.error("Logout error:", error)
    redirect("/auth/login")
  }
}
