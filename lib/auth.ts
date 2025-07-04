import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

/* ------------------------------------------------------------------ */
/*  Tipler                                                             */
/* ------------------------------------------------------------------ */

export type UserRole = "admin" | "acc" | "tech"

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  role: UserRole
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface UserWithAuth extends UserProfile {
  /* Auth tablosundan gelen ek alanlar eklenebilir */
}

/* ------------------------------------------------------------------ */
/*  Yardımcı Fonksiyonlar                                              */
/* ------------------------------------------------------------------ */

/**
 * Geçerli oturumdaki Supabase kullanıcısını döndürür.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("[auth] getCurrentUser error:", error)
    return null
  }
  return user
}

/**
 * Geçerli kullanıcının profilini döndürür.
 * Profil bulunamazsa null döner.
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const user = await getCurrentUser()
  if (!user) return null

  // Önce e-posta ile deneyelim, yoksa user_id ile
  let { data: profile, error } = await supabase.from("user_profiles").select("*").eq("email", user.email).single()

  if (error) {
    const fallback = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()
    profile = fallback.data
    error = fallback.error
  }

  if (error) {
    console.error("[auth] getCurrentUserProfile error:", error)
    return null
  }

  return profile as UserProfile
}

/**
 * Geçerli kullanıcının rolünü döndürür. Rol yoksa null döner.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const profile = await getCurrentUserProfile()
  return profile?.role ?? null
}

/**
 * Basit debug çıktısı almak için yardımcı.
 */
export async function debugCurrentUser() {
  const user = await getCurrentUser()
  const profile = await getCurrentUserProfile()
  return { user, profile }
}

/* ------------------------------------------------------------------ */
/*  Erişim Kontrolü                                                    */
/* ------------------------------------------------------------------ */

/**
 * Sayfa / action içinde çağrıldığında, kullanıcının belirtilen role
 * sahip olduğunu doğrular. Aksi hâlde hata fırlatarak 403 döndürülmesini
 * sağlar (Next.js error boundary veya Route Handler tarafından yakalanır).
 *
 * Örnek:
 *   await requireRole("admin")
 */
export async function requireRole(requiredRole: UserRole) {
  const role = await getCurrentUserRole()
  if (role !== requiredRole) {
    // İsteğe bağlı: burada bir yönlendirme de yapılabilir.
    throw new Error(`Bu işlem için "${requiredRole}" yetkisi gereklidir.`)
  }
}

/**
 * Rol karşılaştırması yapmak için yardımcı.
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const current = await getCurrentUserRole()
  return current === role
}

/**
 * Birden fazla rolden herhangi birine sahip mi?
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const current = await getCurrentUserRole()
  return current ? roles.includes(current) : false
}
