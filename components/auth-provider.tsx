"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import { MainNav } from "./main-nav"

interface AuthContextType {
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

      if (event === "SIGNED_IN" && isAuthPage) {
        router.push("/")
      } else if (event === "SIGNED_OUT" && !isAuthPage) {
        router.push("/auth/login")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, isAuthPage])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      } else {
        setUser(null)
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Error in signOut:", error)
    }
  }

  // Show loading spinner during initial load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated and not on auth page
  if (!user && !isAuthPage) {
    router.push("/auth/login")
    return null
  }

  // Redirect to dashboard if authenticated and on auth page
  if (user && isAuthPage) {
    router.push("/")
    return null
  }

  // Render layout with navigation for authenticated users
  if (user && !isAuthPage) {
    return (
      <AuthContext.Provider value={{ user, loading, signOut }}>
        <div className="min-h-screen bg-background">
          <MainNav />
          <main className="flex-1">{children}</main>
        </div>
      </AuthContext.Provider>
    )
  }

  // Render auth pages without navigation
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
