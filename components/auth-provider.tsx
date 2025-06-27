"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { MainNav } from "@/components/main-nav"
import { usePathname } from "next/navigation"

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
  const pathname = usePathname()

  useEffect(() => {
    // This function now correctly fetches the session on initial load.
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // This listener handles all subsequent auth events like SIGN_IN, SIGN_OUT.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Cleanup subscription on component unmount.
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  const isAuthPage = pathname.startsWith("/auth")

  // If a user is logged in, always show the main navigation.
  // If no user, only render children (the auth pages).
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {user && !isAuthPage ? (
        <div className="flex min-h-screen w-full flex-col">
          <MainNav />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
        </div>
      ) : (
        <>{children}</>
      )}
    </AuthContext.Provider>
  )
}
