"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { UserRole, UserWithAuth } from "@/lib/auth"

// Mevcut kullanıcının rolünü getir
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createClient()

    // Mevcut kullanıcıyı al
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("No authenticated user or auth error:", authError?.message)
      return null
    }

    // Kullanıcı profilini al - önce email ile dene
    let { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("email", user.email)
      .single()

    // Email ile bulunamazsa user_id ile dene
    if (profileError && user.id) {
      const result = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

      profile = result.data
      profileError = result.error
    }

    if (profileError) {
      console.error("Profile error:", profileError.message)
      return null
    }

    return profile?.role || null
  } catch (error) {
    console.error("Error getting current user role:", error)
    return null
  }
}

// Tüm kullanıcıları getir
export async function getUsers(): Promise<UserWithAuth[]> {
  try {
    const supabase = await createClient()

    // Profilleri al
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError)
      return []
    }

    if (!profiles || profiles.length === 0) {
      return []
    }

    // Profilleri UserWithAuth formatına çevir
    const usersWithAuth: UserWithAuth[] = profiles.map((profile) => ({
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role as UserRole,
      status: profile.status as "active" | "inactive",
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }))

    return usersWithAuth
  } catch (error) {
    console.error("Error in getUsers:", error)
    return []
  }
}

// Kullanıcı oluştur
export async function createUser(formData: FormData): Promise<{ success?: string; error?: string }> {
  try {
    const supabase = await createClient()

    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as UserRole
    const status = formData.get("status") as "active" | "inactive"

    if (!fullName || !email || !password || !role) {
      return { error: "Tüm alanları doldurun" }
    }

    if (password.length < 6) {
      return { error: "Şifre en az 6 karakter olmalıdır" }
    }

    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Geçerli bir e-posta adresi girin" }
    }

    // E-posta adresinin kullanılıp kullanılmadığını kontrol et
    const { data: existingProfile } = await supabase.from("user_profiles").select("id").eq("email", email).single()

    if (existingProfile) {
      return { error: "Bu e-posta adresi zaten kullanılıyor" }
    }

    // Profil oluştur
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        full_name: fullName,
        email: email,
        role,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)
      return { error: "Kullanıcı oluşturulamadı: " + profileError.message }
    }

    console.log("Created profile:", profileData)

    revalidatePath("/users")
    return { success: `${fullName} adlı kullanıcı başarıyla oluşturuldu` }
  } catch (error) {
    console.error("Error creating user:", error)
    return { error: "Beklenmeyen bir hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata") }
  }
}

// Kullanıcı getir
export async function getUser(id: string): Promise<UserWithAuth | null> {
  try {
    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single()

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError)
      return null
    }

    return {
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role as UserRole,
      status: profile.status as "active" | "inactive",
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }
  } catch (error) {
    console.error("Error in getUser:", error)
    return null
  }
}

// Kullanıcı güncelle
export async function updateUser(id: string, formData: FormData): Promise<{ success?: string; error?: string }> {
  try {
    const supabase = await createClient()

    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as UserRole
    const status = formData.get("status") as "active" | "inactive"

    if (!fullName || !email || !role) {
      return { error: "Gerekli alanları doldurun" }
    }

    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Geçerli bir e-posta adresi girin" }
    }

    // E-posta çakışması kontrolü (kendisi hariç)
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .neq("id", id)
      .single()

    if (existingProfile) {
      return { error: "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor" }
    }

    // Profili güncelle
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        email: email,
        role,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (profileError) {
      return { error: "Profil güncellenemedi: " + profileError.message }
    }

    revalidatePath("/users")
    revalidatePath(`/users/${id}`)
    return { success: `${fullName} adlı kullanıcının bilgileri başarıyla güncellendi` }
  } catch (error) {
    console.error("Error updating user:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Kullanıcı sil
export async function deleteUser(id: string): Promise<{ success?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Önce kullanıcı adını al
    const { data: profile } = await supabase.from("user_profiles").select("full_name").eq("id", id).single()

    // Profili sil
    const { error: profileError } = await supabase.from("user_profiles").delete().eq("id", id)

    if (profileError) {
      return { error: "Kullanıcı silinemedi: " + profileError.message }
    }

    revalidatePath("/users")
    return { success: `${profile?.full_name || "Kullanıcı"} başarıyla silindi` }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}
