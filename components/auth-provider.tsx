"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { MainNav } from "./main-nav"

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Auth sayfaları listesi
  const authPages = ["/auth/login", "/auth/register"]
  const isAuthPage = authPages.includes(pathname)

  useEffect(() => {
    // Mevcut kullanıcıyı kontrol et
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) {
          console.error("Auth error:", error)
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error("Error getting user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Auth state değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        setLoading(false)
        // Giriş yaptıktan sonra dashboard'a yönlendir (sadece auth sayfasındaysak)
        if (isAuthPage) {
          router.push("/")
          router.refresh()
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setLoading(false)
        // Çıkış yaptıktan sonra login sayfasına yönlendir (auth sayfasında değilsek)
        if (!isAuthPage) {
          router.push("/auth/login")
          router.refresh()
        }
      } else {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, isAuthPage])

  // Loading durumunda
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Kullanıcı giriş yapmamışsa ve auth sayfasında değilse login'e yönlendir
  if (!user && !isAuthPage) {
    router.push("/auth/login")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Kullanıcı giriş yapmışsa ve auth sayfasındaysa dashboard'a yönlendir
  if (user && isAuthPage) {
    router.push("/")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {user && !isAuthPage ? <MainNav>{children}</MainNav> : children}
    </AuthContext.Provider>
  )
}
