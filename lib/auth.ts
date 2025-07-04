import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

export type UserRole = "admin" | "acc" | "tech"

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  role: UserRole
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface UserWithAuth extends UserProfile {
  email: string
}

// Debug fonksiyonu
export async function debugCurrentUser() {
  try {
    const supabase = await createClient()

    // Auth kullanıcısını getir
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return { error: "Auth error: " + authError.message, user: null, profile: null }
    }

    if (!user) {
      return { error: "No authenticated user", user: null, profile: null }
    }

    // Profili getir
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    return {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profile || null,
      profileError: profileError?.message || null,
    }
  } catch (error) {
    return { error: "Unexpected error: " + (error as Error).message }
  }
}

// Mevcut kullanıcıyı getir
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Mevcut kullanıcının profilini getir
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      console.log("No authenticated user found")
      return null
    }

    console.log("Getting profile for user:", user.id, user.email)

    const supabase = await createClient()
    const { data: profile, error } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

    if (error) {
      console.error("Error getting user profile:", error)
      return null
    }

    console.log("Found profile:", profile)
    return profile
  } catch (error) {
    console.error("Error in getCurrentUserProfile:", error)
    return null
  }
}

// Mevcut kullanıcının rolünü getir
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const profile = await getCurrentUserProfile()
    const role = profile?.role || null
    console.log("Current user role:", role)
    return role
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

// Admin kontrolü
export async function requireAdmin(): Promise<void> {
  const role = await getCurrentUserRole()
  console.log("Checking admin requirement, current role:", role)
  if (role !== "admin") {
    throw new Error("Bu işlem için yönetici yetkisi gereklidir.")
  }
}

// Rol kontrolü
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === requiredRole
}

// Çoklu rol kontrolü
export async function hasAnyRole(requiredRoles: UserRole[]): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role ? requiredRoles.includes(role) : false
}
