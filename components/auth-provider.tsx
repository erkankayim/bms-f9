"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/sidebar-nav"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
})

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsAuthenticated(!!session?.user)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session?.user)
      setUser(session?.user ?? null)
      setIsAuthenticated(!!session?.user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Check if current page is an auth page
  const isAuthPage = typeof window !== "undefined" && window.location.pathname.startsWith("/auth")

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated }}>
      {isAuthenticated ? (
        // Authenticated user layout with sidebar
        <div className="flex min-h-screen w-full bg-background">
          <SidebarNav />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      ) : (
        // Unauthenticated user layout (no sidebar)
        <div className="min-h-screen bg-background">{children}</div>
      )}
    </AuthContext.Provider>
  )
}
