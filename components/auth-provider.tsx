"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { MainNav } from "./main-nav"

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
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
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
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

      setUser(session?.user ?? null)
      setLoading(false)

      if (event === "SIGNED_IN" && session?.user) {
        // Force a small delay to ensure state is updated
        setTimeout(() => {
          if (pathname === "/auth/login" || pathname === "/auth/register") {
            router.push("/")
            router.refresh()
          }
        }, 100)
      } else if (event === "SIGNED_OUT") {
        router.push("/auth/login")
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [mounted, router, pathname, supabase.auth])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      }
    } catch (error) {
      console.error("Error in signOut:", error)
    } finally {
      setLoading(false)
    }
  }

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Auth pages
  const isAuthPage = pathname?.startsWith("/auth")

  if (isAuthPage) {
    return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push("/auth/login")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Main app with sidebar
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      <MainNav>{children}</MainNav>
    </AuthContext.Provider>
  )
}
