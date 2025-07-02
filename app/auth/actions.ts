"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { redirect } from "next/navigation"

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })
}

/* ------------------------------------------------------------------ */
/* LOGIN                                                               */
/* ------------------------------------------------------------------ */
export async function loginAction(_prevState: any, formData: FormData) {
  const supabase = getSupabase()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, message: "Giriş başarısız. Bilgilerinizi kontrol edin." }
  }

  // Headerʼın yeniden hydrate olabilmesi için tam sayfa yenileme
  return { success: true }
}

/* ------------------------------------------------------------------ */
/* REGISTER  (named export gerekiyordu)                                */
/* ------------------------------------------------------------------ */
export async function registerAction(_prevState: any, formData: FormData) {
  const supabase = getSupabase()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("name") as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) {
    return { success: false, message: "Kayıt başarısız. Lütfen tekrar deneyin." }
  }

  return { success: true, message: "Kayıt başarılı! E-posta kutunuzu kontrol edin." }
}

/* ------------------------------------------------------------------ */
/* LOGOUT                                                              */
/* ------------------------------------------------------------------ */
export async function logoutAction() {
  const supabase = getSupabase()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
