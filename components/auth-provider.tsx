"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import { MainNav } from "./main-nav"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()

  const isAuthPage = pathname?.startsWith("/auth")

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === "SIGNED_IN") {
        router.push("/")
      } else if (event === "SIGNED_OUT") {
        router.push("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If user is not authenticated and not on auth page, redirect to login
  if (!user && !isAuthPage) {
    router.push("/auth/login")
    return null
  }

  // If user is authenticated and on auth page, redirect to dashboard
  if (user && isAuthPage) {
    router.push("/")
    return null
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {user && !isAuthPage ? (
        <div className="min-h-screen bg-background">
          <MainNav />
          <main className="flex-1">{children}</main>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
