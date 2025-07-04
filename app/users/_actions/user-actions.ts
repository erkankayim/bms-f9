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

    // Önce profilleri al
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError)
      throw new Error("Kullanıcı profilleri getirilemedi: " + profilesError.message)
    }

    if (!profiles || profiles.length === 0) {
      return []
    }

    // Her profil için auth bilgilerini al
    const usersWithAuth: UserWithAuth[] = []

    for (const profile of profiles) {
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(profile.user_id)

        usersWithAuth.push({
          ...profile,
          email: authData.user?.email || "Bilinmiyor",
        })
      } catch (authError) {
        console.error("Error fetching auth data for user:", profile.user_id, authError)
        usersWithAuth.push({
          ...profile,
          email: "Hata",
        })
      }
    }

    return usersWithAuth
  } catch (error) {
    console.error("Error in getUsers:", error)
    throw new Error("Kullanıcılar getirilemedi: " + (error instanceof Error ? error.message : "Bilinmeyen hata"))
  }
}

// Kullanıcı oluştur - Service role ile
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

    // Önce e-posta adresinin kullanılıp kullanılmadığını kontrol et
    const { data: existingProfiles } = await supabase.from("user_profiles").select("id").ilike("full_name", fullName)

    if (existingProfiles && existingProfiles.length > 0) {
      return { error: "Bu isimde bir kullanıcı zaten mevcut" }
    }

    // Service role client oluştur
    const serviceSupabase = createClient()

    // Auth kullanıcısı oluştur
    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
        status: status,
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return { error: "Kullanıcı oluşturulamadı: " + authError.message }
    }

    if (!authData.user) {
      return { error: "Kullanıcı verisi alınamadı" }
    }

    console.log("Created user with ID:", authData.user.id)

    // Kısa bir bekleme süresi ekle
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Profil oluştur
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        user_id: authData.user.id,
        full_name: fullName,
        role,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)
      console.error("User ID:", authData.user.id)

      // Auth kullanıcısını sil (rollback)
      try {
        await serviceSupabase.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error("Failed to delete auth user:", deleteError)
      }

      return { error: "Profil oluşturulamadı: " + profileError.message }
    }

    console.log("Created profile:", profileData)

    revalidatePath("/users")
    return { success: "Kullanıcı başarıyla oluşturuldu" }
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

    // Auth bilgilerini al
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(profile.user_id)

    return {
      ...profile,
      email: authData.user?.email || "Bilinmiyor",
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
        console.error("Auth update error:", authError)
        // Profil güncellemesi başarılı olduğu için devam et
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

    // Auth kullanıcısını silmeye çalış (başarısız olursa da devam et)
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(profile.user_id)
      if (authError) {
        console.error("Auth user deletion error:", authError)
      }
    } catch (error) {
      console.error("Auth deletion failed:", error)
    }

    revalidatePath("/users")
    return { success: "Kullanıcı başarıyla silindi" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}
