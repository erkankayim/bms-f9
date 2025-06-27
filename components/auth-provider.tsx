"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { usePathname, useRouter } from "next/navigation"
import { MainNav } from "./main-nav"

type AuthContextType = {
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

  const isAuthPage = pathname?.startsWith("/auth/")

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
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  // Redirect logic
  useEffect(() => {
    if (!loading) {
      if (!user && !isAuthPage) {
        router.push("/auth/login")
      } else if (user && isAuthPage) {
        router.push("/")
      }
    }
  }, [user, loading, isAuthPage, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show auth pages without layout
  if (isAuthPage) {
    return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
  }

  // Show main app with layout
  if (user) {
    return (
      <AuthContext.Provider value={{ user, loading, signOut }}>
        <div className="min-h-screen bg-background">
          <MainNav />
          <main className="flex-1">{children}</main>
        </div>
      </AuthContext.Provider>
    )
  }

  // Loading state or redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
