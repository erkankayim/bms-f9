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

    // Kullanıcı profilini al
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

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

    const { data, error } = await supabase
      .from("user_profiles")
      .select(`
        *,
        auth_users:user_id (
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      throw new Error("Kullanıcılar getirilemedi")
    }

    // Veriyi düzenle
    const users: UserWithAuth[] = data.map((user: any) => ({
      id: user.id,
      user_id: user.user_id,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email: user.auth_users?.email || "Bilinmiyor",
    }))

    return users
  } catch (error) {
    console.error("Error in getUsers:", error)
    throw error
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

    // Auth kullanıcısı oluştur
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return { error: "Kullanıcı oluşturulamadı: " + authError.message }
    }

    if (!authData.user) {
      return { error: "Kullanıcı verisi alınamadı" }
    }

    // Profil oluştur
    const { error: profileError } = await supabase.from("user_profiles").insert({
      user_id: authData.user.id,
      full_name: fullName,
      role,
      status,
    })

    if (profileError) {
      return { error: "Profil oluşturulamadı: " + profileError.message }
    }

    revalidatePath("/users")
    return { success: "Kullanıcı başarıyla oluşturuldu" }
  } catch (error) {
    console.error("Error creating user:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Kullanıcı getir
export async function getUser(id: string): Promise<UserWithAuth | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_profiles")
      .select(`
        *,
        auth_users:user_id (
          email
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return {
      id: data.id,
      user_id: data.user_id,
      full_name: data.full_name,
      role: data.role,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      email: data.auth_users?.email || "Bilinmiyor",
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
    const password = formData.get("password") as string
    const role = formData.get("role") as UserRole
    const status = formData.get("status") as "active" | "inactive"

    if (!fullName || !role) {
      return { error: "Gerekli alanları doldurun" }
    }

    // Kullanıcıyı bul
    const { data: profile, error: profileFetchError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("id", id)
      .single()

    if (profileFetchError || !profile) {
      return { error: "Kullanıcı bulunamadı" }
    }

    // Profili güncelle
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        role,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (profileError) {
      return { error: "Profil güncellenemedi: " + profileError.message }
    }

    // E-posta ve şifre güncelle (varsa)
    if (email || password) {
      const updateData: any = {}
      if (email) updateData.email = email
      if (password) updateData.password = password

      const { error: authError } = await supabase.auth.admin.updateUserById(profile.user_id, updateData)

      if (authError) {
        return { error: "Auth bilgileri güncellenemedi: " + authError.message }
      }
    }

    revalidatePath("/users")
    revalidatePath(`/users/${id}`)
    return { success: "Kullanıcı başarıyla güncellendi" }
  } catch (error) {
    console.error("Error updating user:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Kullanıcı sil
export async function deleteUser(id: string): Promise<{ success?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Kullanıcıyı bul
    const { data: profile, error: profileFetchError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("id", id)
      .single()

    if (profileFetchError || !profile) {
      return { error: "Kullanıcı bulunamadı" }
    }

    // Profili sil
    const { error: profileError } = await supabase.from("user_profiles").delete().eq("id", id)

    if (profileError) {
      return { error: "Profil silinemedi: " + profileError.message }
    }

    // Auth kullanıcısını sil
    const { error: authError } = await supabase.auth.admin.deleteUser(profile.user_id)

    if (authError) {
      console.error("Auth user deletion error:", authError)
      // Profil silindiği için devam et
    }

    revalidatePath("/users")
    return { success: "Kullanıcı başarıyla silindi" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}
