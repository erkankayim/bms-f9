"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
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
  if (context === undefined) {
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

  const isAuthPage = pathname?.startsWith("/auth/")

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Auth error:", error)
          setUser(null)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error("Error getting session:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        setLoading(false)
        // Sadece auth sayfasındaysak dashboard'a yönlendir
        if (isAuthPage) {
          window.location.href = "/"
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setLoading(false)
        // Sadece auth sayfasında değilsek login'e yönlendir
        if (!isAuthPage) {
          window.location.href = "/auth/login"
        }
      } else {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, isAuthPage])

  // Loading durumunda
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Kullanıcı giriş yapmamışsa ve auth sayfasında değilse login'e yönlendir
  if (!user && !isAuthPage) {
    router.push("/auth/login")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Kullanıcı giriş yapmışsa ve auth sayfasındaysa dashboard'a yönlendir
  if (user && isAuthPage) {
    router.push("/")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {user && !isAuthPage && <MainNav />}
      <main className={user && !isAuthPage ? "min-h-screen bg-gray-50" : ""}>{children}</main>
    </AuthContext.Provider>
  )
}
