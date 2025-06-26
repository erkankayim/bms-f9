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

  return users.users
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

  return user.user
}

// Yeni kullanıcı oluştur
export async function createUser({
  email,
  password,
  fullName,
}: {
  email: string
  password: string
  fullName: string
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

  revalidatePath("/users")
  return data.user
}

// Kullanıcı güncelle
export async function updateUser({
  id,
  email,
  fullName,
  password,
}: {
  id: string
  email: string
  fullName: string
  password?: string
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
