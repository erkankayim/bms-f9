"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function loginAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return {
      message: "Giriş başarısız. E-posta ve şifrenizi kontrol edin.",
    }
  }

  revalidatePath("/", "layout")

  // redirect yerine success flag döndürüyoruz
  return {
    success: true,
    message: "Giriş başarılı!",
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("name") as string,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return {
      message: "Kayıt başarısız. Lütfen tekrar deneyin.",
    }
  }

  return {
    message: "Kayıt başarılı! E-posta adresinizi kontrol edin.",
  }
}

export async function logoutAction() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")

  // Client-side yönlendirme için success flag
  return {
    success: true,
  }
}
