"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { UserRole, UserProfile } from "@/app/lib/types"

const UserSchema = z.object({
  fullName: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır."),
  email: z.string().email("Geçersiz e-posta adresi."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır.").optional().or(z.literal("")),
  role: z.enum(["admin", "acc", "tech"]),
  status: z.enum(["active", "inactive"]),
})

// Helper to check if the current user is an admin
async function isAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

  return profile?.role === "admin"
}

export async function createUser(prevState: any, formData: FormData) {
  if (!(await isAdmin())) {
    return { success: false, message: "Yetkisiz işlem." }
  }

  const validatedFields = UserSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    status: formData.get("status"),
  })

  if (!validatedFields.success) {
    return { success: false, message: "Geçersiz form verileri.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const { email, password, fullName, role, status } = validatedFields.data

  if (!password) {
    return { success: false, message: "Yeni kullanıcı için şifre zorunludur." }
  }

  const supabase = createClient()

  // Create user in auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Automatically confirm email
    user_metadata: { full_name: fullName },
  })

  if (authError || !authData.user) {
    return { success: false, message: authError?.message || "Kullanıcı oluşturulamadı." }
  }

  // Update profile created by trigger
  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({ role, status, full_name: fullName })
    .eq("user_id", authData.user.id)

  if (profileError) {
    // If profile update fails, delete the created auth user
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { success: false, message: profileError.message || "Kullanıcı profili güncellenemedi." }
  }

  revalidatePath("/users")
  return { success: true, message: "Kullanıcı başarıyla oluşturuldu." }
}

export async function updateUser(userId: string, prevState: any, formData: FormData) {
  if (!(await isAdmin())) {
    return { success: false, message: "Yetkisiz işlem." }
  }

  const validatedFields = UserSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    status: formData.get("status"),
  })

  if (!validatedFields.success) {
    return { success: false, message: "Geçersiz form verileri.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const { email, password, fullName, role, status } = validatedFields.data

  const supabase = createClient()

  // Update profile
  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({ full_name: fullName, role, status })
    .eq("user_id", userId)

  if (profileError) {
    return { success: false, message: profileError.message || "Profil güncellenemedi." }
  }

  // Update auth data
  const authUpdateData: { email?: string; password?: string } = { email }
  if (password) {
    authUpdateData.password = password
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdateData)

  if (authError) {
    return { success: false, message: authError.message || "Auth bilgileri güncellenemedi." }
  }

  revalidatePath("/users")
  revalidatePath(`/users/${userId}/edit`)
  return { success: true, message: "Kullanıcı başarıyla güncellendi." }
}

export async function getUsers(): Promise<{ users: UserProfile[]; error?: string }> {
  if (!(await isAdmin())) {
    return { users: [], error: "Yetkisiz işlem." }
  }

  const supabase = createClient()
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    return { users: [], error: authError.message }
  }

  const { data: profiles, error: profileError } = await supabase.from("user_profiles").select("*")

  if (profileError) {
    return { users: [], error: profileError.message }
  }

  const users = authUsers.users.map((user) => {
    const profile = profiles.find((p) => p.user_id === user.id)
    return {
      id: user.id,
      email: user.email || "",
      full_name: profile?.full_name || user.user_metadata?.full_name || "N/A",
      role: profile?.role || "tech",
      status: profile?.status || "inactive",
      created_at: user.created_at,
    }
  })

  return { users }
}

export async function getUserById(userId: string): Promise<{ user: UserProfile | null; error?: string }> {
  if (!(await isAdmin())) {
    return { user: null, error: "Yetkisiz işlem." }
  }

  const supabase = createClient()
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

  if (authError || !authUser.user) {
    return { user: null, error: authError?.message || "Kullanıcı bulunamadı." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (profileError) {
    return { user: null, error: profileError.message }
  }

  const user = {
    id: authUser.user.id,
    email: authUser.user.email || "",
    full_name: profile.full_name,
    role: profile.role,
    status: profile.status,
    created_at: authUser.user.created_at,
  }

  return { user }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  if (!(await isAdmin())) {
    return { success: false, message: "Yetkisiz işlem." }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return { success: false, message: error.message }
  }

  // The profile is deleted automatically by the ON DELETE CASCADE constraint
  revalidatePath("/users")
  return { success: true, message: "Kullanıcı başarıyla silindi." }
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

  if (error) return null
  return profile.role
}
