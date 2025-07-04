import { createClient } from "@/lib/supabase/server"

export type UserRole = "admin" | "acc" | "tech"

export interface UserWithAuth {
  id: number
  user_id: string
  full_name: string
  email: string
  role: UserRole
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { user: null, profile: null, error: "Kullanıcı bulunamadı" }
    }

    // Kullanıcı profilini al - önce email ile dene
    let { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", user.email)
      .single()

    // Email ile bulunamazsa user_id ile dene
    if (profileError && user.id) {
      const result = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      profile = result.data
      profileError = result.error
    }

    return {
      user,
      profile,
      profileError: profileError?.message || null,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return { user: null, profile: null, error: "Beklenmeyen hata" }
  }
}

export async function requireRole(allowedRoles: UserRole[]) {
  const { user, profile } = await getCurrentUser()

  if (!user || !profile) {
    throw new Error("Giriş yapmanız gerekiyor")
  }

  if (!allowedRoles.includes(profile.role)) {
    throw new Error("Bu işlem için yetkiniz bulunmuyor")
  }

  return { user, profile }
}
