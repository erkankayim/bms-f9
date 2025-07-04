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

// Mevcut kullanıcıyı getir
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Mevcut kullanıcının profilini getir
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  return profile
}

// Mevcut kullanıcının rolünü getir
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const profile = await getCurrentUserProfile()
  return profile?.role || null
}

// Admin kontrolü
export async function requireAdmin(): Promise<void> {
  const role = await getCurrentUserRole()
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
