"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { message: "E-posta ve şifre gereklidir." }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error)
    return { message: "Giriş başarısız: Geçersiz e-posta veya şifre." }
  }

  // Revalidate the entire layout to ensure server components are updated.
  revalidatePath("/", "layout")
  redirect("/")
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/auth/login")
}

// registerAction remains unchanged.
export async function registerAction(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { message: "Tüm alanlar gereklidir." }
  }

  if (password.length < 6) {
    return { message: "Şifre en az 6 karakter olmalıdır." }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    console.error("Registration error:", error)
    return { message: "Kayıt başarısız: " + error.message }
  }

  return {
    message: "Kayıt başarılı! Giriş yapabilirsiniz.",
  }
}
