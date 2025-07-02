"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCurrentUserRole() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("User not found:", userError)
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (profileError) {
      console.log("Profile error:", profileError)
      return "admin" // Default to admin if no profile found
    }

    return profile?.role || "admin"
  } catch (error) {
    console.error("Error getting user role:", error)
    return "admin"
  }
}

export async function getAllUsers() {
  const supabase = await createClient()

  try {
    // First check if current user is admin
    const currentUserRole = await getCurrentUserRole()
    if (currentUserRole !== "admin") {
      return { error: "Yetkisiz erişim" }
    }

    const { data: users, error } = await supabase
      .from("user_profiles")
      .select(`
        user_id,
        email,
        full_name,
        role,
        created_at
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return { error: "Kullanıcılar yüklenemedi" }
    }

    return { data: users }
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function getUserById(userId: string) {
  const supabase = await createClient()

  try {
    const { data: user, error } = await supabase
      .from("user_profiles")
      .select(`
        user_id,
        email,
        full_name,
        role,
        created_at
      `)
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error fetching user:", error)
      return { error: "Kullanıcı bulunamadı" }
    }

    return { data: user }
  } catch (error) {
    console.error("Error in getUserById:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function createUser(formData: FormData) {
  const supabase = await createClient()

  try {
    // Check if current user is admin
    const currentUserRole = await getCurrentUserRole()
    if (currentUserRole !== "admin") {
      return { error: "Yetkisiz erişim" }
    }

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("full_name") as string
    const role = formData.get("role") as string

    if (!email || !password || !fullName || !role) {
      return { error: "Tüm alanlar zorunludur" }
    }

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Auth error:", authError)
      return { error: "Kullanıcı oluşturulamadı: " + authError.message }
    }

    if (!authData.user) {
      return { error: "Kullanıcı oluşturulamadı" }
    }

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      user_id: authData.user.id,
      email,
      full_name: fullName,
      role,
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      return { error: "Kullanıcı profili oluşturulamadı" }
    }

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Error in createUser:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const supabase = await createClient()

  try {
    // Check if current user is admin
    const currentUserRole = await getCurrentUserRole()
    if (currentUserRole !== "admin") {
      return { error: "Yetkisiz erişim" }
    }

    const email = formData.get("email") as string
    const fullName = formData.get("full_name") as string
    const role = formData.get("role") as string

    if (!email || !fullName || !role) {
      return { error: "Tüm alanlar zorunludur" }
    }

    console.log("Updating user:", { userId, email, fullName, role })

    // Update user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        email,
        full_name: fullName,
        role,
      })
      .eq("user_id", userId)

    if (profileError) {
      console.error("Profile update error:", profileError)
      return { error: "Kullanıcı güncellenemedi: " + profileError.message }
    }

    // Update auth user email if changed
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      email,
    })

    if (authError) {
      console.error("Auth update error:", authError)
      // Don't return error here as profile update succeeded
    }

    revalidatePath("/users")
    revalidatePath(`/users/${userId}/edit`)

    console.log("User updated successfully")
    return { success: true }
  } catch (error) {
    console.error("Error in updateUser:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  try {
    // Check if current user is admin
    const currentUserRole = await getCurrentUserRole()
    if (currentUserRole !== "admin") {
      return { error: "Yetkisiz erişim" }
    }

    // Delete user profile first
    const { error: profileError } = await supabase.from("user_profiles").delete().eq("user_id", userId)

    if (profileError) {
      console.error("Profile delete error:", profileError)
      return { error: "Kullanıcı profili silinemedi" }
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Auth delete error:", authError)
      return { error: "Kullanıcı silinemedi" }
    }

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteUser:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export { getAllUsers as getUsers }
