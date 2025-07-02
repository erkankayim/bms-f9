"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Kullanıcıları getir
export async function getUsers() {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })

  const { data: users, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error("Kullanıcılar getirilirken hata oluştu:", error)
    throw new Error("Kullanıcılar getirilirken bir hata oluştu")
  }

  // Kullanıcı profillerini de getir
  const { data: profiles } = await supabase.from("user_profiles").select("user_id, role, full_name")

  // Kullanıcıları profilleriyle birleştir
  const usersWithProfiles = users.users.map((user) => {
    const profile = profiles?.find((p) => p.user_id === user.id)
    return {
      ...user,
      role: profile?.role || "admin",
      full_name: profile?.full_name || user.user_metadata?.full_name || user.email,
    }
  })

  return usersWithProfiles
}

// Kullanıcı detaylarını getir
export async function getUserById(id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })

  const { data: user, error } = await supabase.auth.admin.getUserById(id)

  if (error) {
    console.error("Kullanıcı getirilirken hata oluştu:", error)
    throw new Error("Kullanıcı getirilirken bir hata oluştu")
  }

  // Kullanıcı profilini getir
  const { data: profile } = await supabase.from("user_profiles").select("role, full_name").eq("user_id", id).single()

  return {
    ...user.user,
    role: profile?.role || "admin",
    full_name: profile?.full_name || user.user.user_metadata?.full_name || user.user.email,
  }
}

// Yeni kullanıcı oluştur
export async function createUser({
  email,
  password,
  fullName,
  role = "admin",
}: {
  email: string
  password: string
  fullName: string
  role?: "admin" | "tech" | "acc"
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  })

  if (error) {
    console.error("Kullanıcı oluşturulurken hata oluştu:", error)
    throw new Error(error.message || "Kullanıcı oluşturulurken bir hata oluştu")
  }

  // Kullanıcı profili oluştur
  await supabase.from("user_profiles").upsert({
    user_id: data.user.id,
    role,
    full_name: fullName,
  })

  revalidatePath("/users")
  return data.user
}

// Kullanıcı güncelle
export async function updateUser({
  id,
  email,
  fullName,
  password,
  role = "admin",
}: {
  id: string
  email: string
  fullName: string
  password?: string
  role?: "admin" | "tech" | "acc"
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })

  const updateData: any = {
    email,
    user_metadata: {
      full_name: fullName,
    },
  }

  if (password) {
    updateData.password = password
  }

  const { data, error } = await supabase.auth.admin.updateUserById(id, updateData)

  if (error) {
    console.error("Kullanıcı güncellenirken hata oluştu:", error)
    throw new Error(error.message || "Kullanıcı güncellenirken bir hata oluştu")
  }

  // Kullanıcı profilini güncelle
  await supabase.from("user_profiles").upsert({
    user_id: id,
    role,
    full_name: fullName,
  })

  revalidatePath("/users")
  return data.user
}

// Kullanıcı sil
export async function deleteUser(id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })

  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    console.error("Kullanıcı silinirken hata oluştu:", error)
    throw new Error("Kullanıcı silinirken bir hata oluştu")
  }

  revalidatePath("/users")
  return true
}

// Mevcut kullanıcının rolünü getir
export async function getCurrentUserRole() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

  return profile?.role || "admin"
}
