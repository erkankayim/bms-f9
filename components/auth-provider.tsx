"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
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

      if (event === "SIGNED_IN" && isAuthPage) {
        router.push("/")
      } else if (event === "SIGNED_OUT" && !isAuthPage) {
        router.push("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router, isAuthPage])

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Show auth pages without navigation
  if (isAuthPage) {
    return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
  }

  // Show main app with navigation for authenticated users
  if (user) {
    return (
      <AuthContext.Provider value={{ user, loading }}>
        <div className="min-h-screen bg-background">
          <MainNav />
          <main className="container mx-auto py-6">{children}</main>
        </div>
      </AuthContext.Provider>
    )
  }

  // Show loading or redirect for unauthenticated users
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  )
}
