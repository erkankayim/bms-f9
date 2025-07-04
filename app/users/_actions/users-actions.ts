"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { CreateUserData, UpdateUserData, UserWithAuth } from "@/app/lib/types"

// Get current user's role for authorization
export async function getCurrentUserRole(): Promise<"admin" | "acc" | "tech" | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

  return profile?.role || null
}

// Check if user is admin
async function requireAdmin() {
  const role = await getCurrentUserRole()
  if (role !== "admin") {
    throw new Error("Bu işlem için yönetici yetkisi gereklidir.")
  }
}

export async function getUsers(): Promise<UserWithAuth[]> {
  await requireAdmin()

  const supabase = await createClient()

  // Get user profiles with auth data
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (profilesError) {
    console.error("Error fetching user profiles:", profilesError)
    throw new Error("Kullanıcılar getirilemedi")
  }

  // Get auth users to get emails
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error("Error fetching auth users:", authError)
    throw new Error("Kullanıcı bilgileri getirilemedi")
  }

  // Combine profile and auth data
  const usersWithAuth: UserWithAuth[] = profiles.map((profile) => {
    const authUser = authUsers.users.find((u) => u.id === profile.user_id)
    return {
      ...profile,
      email: authUser?.email || "Bilinmiyor",
    }
  })

  return usersWithAuth
}

export async function getUserById(id: string): Promise<UserWithAuth | null> {
  await requireAdmin()

  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase.from("user_profiles").select("*").eq("id", id).single()

  if (profileError || !profile) {
    return null
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.user_id)

  if (authError || !authUser.user) {
    return null
  }

  return {
    ...profile,
    email: authUser.user.email || "Bilinmiyor",
  }
}

export async function createUser(_prevState: any, formData: FormData) {
  try {
    await requireAdmin()

    const userData: CreateUserData = {
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as "admin" | "acc" | "tech",
      status: formData.get("status") as "active" | "inactive",
    }

    // Validate required fields
    if (!userData.full_name || !userData.email || !userData.password) {
      return { success: false, message: "Tüm alanları doldurun" }
    }

    const supabase = await createClient()

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      user_metadata: {
        full_name: userData.full_name,
      },
    })

    if (authError) {
      console.error("Auth user creation error:", authError)
      return { success: false, message: "Kullanıcı oluşturulamadı: " + authError.message }
    }

    if (!authData.user) {
      return { success: false, message: "Kullanıcı oluşturulamadı" }
    }

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      user_id: authData.user.id,
      full_name: userData.full_name,
      role: userData.role,
      status: userData.status,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { success: false, message: "Kullanıcı profili oluşturulamadı" }
    }

    revalidatePath("/users")
    return { success: true, message: "Kullanıcı başarıyla oluşturuldu" }
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Bir hata oluştu" }
  }
}

export async function updateUser(_prevState: any, formData: FormData) {
  try {
    await requireAdmin()

    const userId = formData.get("id") as string
    const userData: UpdateUserData = {
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as "admin" | "acc" | "tech",
      status: formData.get("status") as "active" | "inactive",
    }

    if (!userId || !userData.full_name) {
      return { success: false, message: "Gerekli alanları doldurun" }
    }

    const supabase = await createClient()

    // Get current user profile
    const { data: currentProfile, error: profileFetchError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("id", userId)
      .single()

    if (profileFetchError || !currentProfile) {
      return { success: false, message: "Kullanıcı bulunamadı" }
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        full_name: userData.full_name,
        role: userData.role,
        status: userData.status,
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Profile update error:", profileError)
      return { success: false, message: "Kullanıcı profili güncellenemedi" }
    }

    // Update auth user if email or password changed
    const authUpdates: any = {}
    if (userData.email) {
      authUpdates.email = userData.email
    }
    if (userData.password) {
      authUpdates.password = userData.password
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.admin.updateUserById(currentProfile.user_id, authUpdates)

      if (authError) {
        console.error("Auth update error:", authError)
        return { success: false, message: "Kullanıcı bilgileri güncellenemedi: " + authError.message }
      }
    }

    revalidatePath("/users")
    return { success: true, message: "Kullanıcı başarıyla güncellendi" }
  } catch (error) {
    console.error("Update user error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Bir hata oluştu" }
  }
}

export async function deleteUser(userId: string) {
  try {
    await requireAdmin()

    const supabase = await createClient()

    // Get user profile to get auth user ID
    const { data: profile, error: profileFetchError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("id", userId)
      .single()

    if (profileFetchError || !profile) {
      throw new Error("Kullanıcı bulunamadı")
    }

    // Delete auth user (this will cascade delete the profile due to foreign key)
    const { error: authError } = await supabase.auth.admin.deleteUser(profile.user_id)

    if (authError) {
      console.error("Auth user deletion error:", authError)
      throw new Error("Kullanıcı silinemedi: " + authError.message)
    }

    revalidatePath("/users")
    return { success: true, message: "Kullanıcı başarıyla silindi" }
  } catch (error) {
    console.error("Delete user error:", error)
    throw error
  }
}

export async function getCurrentUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  return profile
}
