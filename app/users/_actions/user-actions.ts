"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin, getCurrentUserRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { UserRole, UserWithAuth } from "@/lib/auth"

// Tüm kullanıcıları getir
export async function getUsers(): Promise<UserWithAuth[]> {
  await requireAdmin()

  const supabase = await createClient()

  // Profilleri getir
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (profilesError) {
    throw new Error("Kullanıcılar getirilemedi: " + profilesError.message)
  }

  // Auth kullanıcılarını getir
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    throw new Error("Kullanıcı bilgileri getirilemedi: " + authError.message)
  }

  // Birleştir
  const usersWithAuth: UserWithAuth[] = profiles.map((profile) => {
    const authUser = authData.users.find((u) => u.id === profile.user_id)
    return {
      ...profile,
      email: authUser?.email || "Bilinmiyor",
    }
  })

  return usersWithAuth
}

// Kullanıcı detayını getir
export async function getUserById(id: string): Promise<UserWithAuth | null> {
  await requireAdmin()

  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase.from("user_profiles").select("*").eq("id", id).single()

  if (profileError || !profile) {
    return null
  }

  const { data: authData, error: authError } = await supabase.auth.admin.getUserById(profile.user_id)

  if (authError || !authData.user) {
    return null
  }

  return {
    ...profile,
    email: authData.user.email || "Bilinmiyor",
  }
}

// Yeni kullanıcı oluştur
export async function createUser(formData: FormData) {
  try {
    await requireAdmin()

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

    const supabase = await createClient()

    // Auth kullanıcısı oluştur
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError || !authData.user) {
      return { error: "Kullanıcı oluşturulamadı: " + (authError?.message || "Bilinmeyen hata") }
    }

    // Profili güncelle (trigger otomatik oluşturdu)
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        role,
        status,
      })
      .eq("user_id", authData.user.id)

    if (updateError) {
      // Hata durumunda auth kullanıcısını sil
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { error: "Kullanıcı profili güncellenemedi: " + updateError.message }
    }

    revalidatePath("/users")
    return { success: "Kullanıcı başarıyla oluşturuldu" }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Bir hata oluştu" }
  }
}

// Kullanıcı güncelle
export async function updateUser(userId: string, formData: FormData) {
  try {
    await requireAdmin()

    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as UserRole
    const status = formData.get("status") as "active" | "inactive"

    if (!fullName || !role) {
      return { error: "Ad soyad ve rol gereklidir" }
    }

    const supabase = await createClient()

    // Profili getir
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      return { error: "Kullanıcı bulunamadı" }
    }

    // Profili güncelle
    const { error: updateProfileError } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        role,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateProfileError) {
      return { error: "Profil güncellenemedi: " + updateProfileError.message }
    }

    // Auth bilgilerini güncelle
    const authUpdates: any = {}
    if (email) authUpdates.email = email
    if (password && password.length >= 6) authUpdates.password = password

    if (Object.keys(authUpdates).length > 0) {
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(profile.user_id, authUpdates)
      if (authUpdateError) {
        return { error: "Auth bilgileri güncellenemedi: " + authUpdateError.message }
      }
    }

    revalidatePath("/users")
    revalidatePath(`/users/${userId}`)
    return { success: "Kullanıcı başarıyla güncellendi" }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Bir hata oluştu" }
  }
}

// Kullanıcı sil
export async function deleteUser(userId: string) {
  try {
    await requireAdmin()

    const supabase = await createClient()

    // Profili getir
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Auth kullanıcısını sil (profil otomatik silinecek)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(profile.user_id)

    if (deleteError) {
      throw new Error("Kullanıcı silinemedi: " + deleteError.message)
    }

    revalidatePath("/users")
    return { success: "Kullanıcı başarıyla silindi" }
  } catch (error) {
    throw error
  }
}

// Mevcut kullanıcının rolünü export et
export { getCurrentUserRole }
