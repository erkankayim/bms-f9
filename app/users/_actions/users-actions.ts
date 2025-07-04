"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { UserRole, UserWithAuth } from "@/app/lib/types"

// Get current user's role for authorization
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("No user found or error:", userError)
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (profileError) {
      console.log("Profile error:", profileError)
      return null
    }

    console.log("User role:", profile?.role)
    return profile?.role || null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
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

  // Get user profiles
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

    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as UserRole
    const status = formData.get("status") as "active" | "inactive"

    // Validate required fields
    if (!fullName || !email || !password) {
      return { success: false, message: "Tüm alanları doldurun" }
    }

    if (password.length < 6) {
      return { success: false, message: "Şifre en az 6 karakter olmalıdır" }
    }

    const supabase = await createClient()

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError) {
      console.error("Auth user creation error:", authError)
      return { success: false, message: "Kullanıcı oluşturulamadı: " + authError.message }
    }

    if (!authData.user) {
      return { success: false, message: "Kullanıcı oluşturulamadı" }
    }

    // Update the automatically created profile with correct role and status
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        role,
        status,
      })
      .eq("user_id", authData.user.id)

    if (profileError) {
      console.error("Profile update error:", profileError)
      // If profile update fails, delete the created auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { success: false, message: "Kullanıcı profili güncellenemedi" }
    }

    revalidatePath("/users")
    return { success: true, message: "Kullanıcı başarıyla oluşturuldu" }
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Bir hata oluştu" }
  }
}

export async function updateUser(userId: string, _prevState: any, formData: FormData) {
  try {
    await requireAdmin()

    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as UserRole
    const status = formData.get("status") as "active" | "inactive"

    if (!fullName) {
      return { success: false, message: "Ad soyad gereklidir" }
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
        full_name: fullName,
        role,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Profile update error:", profileError)
      return { success: false, message: "Kullanıcı profili güncellenemedi" }
    }

    // Update auth user if email or password changed
    const authUpdates: any = {}
    if (email) {
      authUpdates.email = email
    }
    if (password && password.length >= 6) {
      authUpdates.password = password
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.admin.updateUserById(currentProfile.user_id, authUpdates)

      if (authError) {
        console.error("Auth update error:", authError)
        return { success: false, message: "Kullanıcı bilgileri güncellenemedi: " + authError.message }
      }
    }

    revalidatePath("/users")
    revalidatePath(`/users/${userId}/edit`)
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
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("No user found:", userError)
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (profileError) {
      console.log("Profile error:", profileError)
      return null
    }

    return profile
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Debug function to check user status
export async function debugUserStatus() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("Auth user:", user)
    console.log("Auth error:", userError)

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      console.log("Profile:", profile)
      console.log("Profile error:", profileError)
    }

    return { user, userError }
  } catch (error) {
    console.error("Debug error:", error)
    return { error }
  }
}
