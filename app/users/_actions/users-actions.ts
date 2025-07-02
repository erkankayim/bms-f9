"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type UserRole = "admin" | "tech" | "acc"

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)
      return "admin" // Default to admin if no profile found
    }

    return profile?.role || "admin"
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

export async function getUsers(): Promise<UserProfile[]> {
  try {
    const supabase = createClient()

    // Get user profiles first
    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select(`
        user_id,
        full_name,
        role,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    if (profileError) {
      console.error("Error fetching user profiles:", profileError)
      return []
    }

    if (!profiles || profiles.length === 0) {
      console.log("No user profiles found")
      return []
    }

    console.log(`Found ${profiles.length} user profiles`)

    // Get auth users to fetch emails
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error("Error fetching auth users:", authError)
      // Return profiles without emails if auth fails
      return profiles.map((profile) => ({
        id: profile.user_id,
        email: "Email alınamadı",
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }))
    }

    // Combine profile data with auth user data
    const usersWithEmails = profiles.map((profile) => {
      const authUser = authData.users.find((u) => u.id === profile.user_id)
      return {
        id: profile.user_id,
        email: authUser?.email || "Email bulunamadı",
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }
    })

    console.log(`Returning ${usersWithEmails.length} users with emails`)
    return usersWithEmails
  } catch (error) {
    console.error("Unexpected error fetching users:", error)
    return []
  }
}

export async function getAllUsers(): Promise<{ data?: UserProfile[]; error?: string }> {
  try {
    const users = await getUsers()
    return { data: users }
  } catch (error) {
    return { error: "Kullanıcılar alınırken hata oluştu" }
  }
}

export async function getUserById(id: string): Promise<{ data?: UserProfile; error?: string }> {
  try {
    const supabase = createClient()

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select(`
        user_id,
        full_name,
        role,
        created_at,
        updated_at
      `)
      .eq("user_id", id)
      .single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return { error: `Kullanıcı alınırken hata: ${error.message}` }
    }

    // Get auth user for email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id)

    if (authError) {
      console.error("Error fetching auth user:", authError)
      return { error: "Kullanıcı bilgileri alınırken hata oluştu" }
    }

    const userWithEmail = {
      id: profile.user_id,
      email: authUser.user?.email || "Email bulunamadı",
      full_name: profile.full_name,
      role: profile.role,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }

    return { data: userWithEmail }
  } catch (error) {
    console.error("Unexpected error fetching user:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function createUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("full_name") as string
    const role = formData.get("role") as UserRole

    if (!email || !password || !fullName || !role) {
      return { success: false, error: "Tüm alanlar gereklidir" }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      console.error("Auth creation error:", authError)
      return { success: false, error: `Kullanıcı oluşturulurken hata: ${authError?.message}` }
    }

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      user_id: authData.user.id,
      full_name: fullName,
      role,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Try to delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: `Kullanıcı profili oluşturulurken hata: ${profileError.message}` }
    }

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error creating user:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateUser(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const fullName = formData.get("full_name") as string
    const role = formData.get("role") as UserRole

    console.log("Updating user:", { id, fullName, role })

    if (!fullName || !role) {
      return { success: false, error: "Tüm alanlar gereklidir" }
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", id)

    if (error) {
      console.error("Update error:", error)
      return { success: false, error: `Kullanıcı güncellenirken hata: ${error.message}` }
    }

    console.log("User updated successfully")
    revalidatePath("/users")
    revalidatePath(`/users/${id}/edit`)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error updating user:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Delete user profile first
    const { error: profileError } = await supabase.from("user_profiles").delete().eq("user_id", id)

    if (profileError) {
      console.error("Profile deletion error:", profileError)
      return { success: false, error: `Kullanıcı profili silinirken hata: ${profileError.message}` }
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      console.error("Auth deletion error:", authError)
      return { success: false, error: `Kullanıcı silinirken hata: ${authError.message}` }
    }

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting user:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}
