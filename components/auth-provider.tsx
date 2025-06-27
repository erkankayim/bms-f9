"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { MainNav } from "@/components/main-nav"

interface AuthContextType {
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
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
        }
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session?.user)
      setUser(session?.user ?? null)
      setLoading(false)

      // Force a page refresh for login/logout to ensure proper state sync
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        // Small delay to ensure state is updated
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Check if current page is an auth page
  const isAuthPage = typeof window !== "undefined" && window.location.pathname.startsWith("/auth")

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {user ? (
        // Giriş yapmış kullanıcı için tam layout
        <div className="flex min-h-screen w-full flex-col">
          <MainNav />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
        </div>
      ) : (
        // Giriş yapmamış kullanıcı için sadece auth sayfaları
        <div className="min-h-screen">{children}</div>
      )}
    </AuthContext.Provider>
  )
}
