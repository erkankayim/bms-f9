"use client"

import type { ReactNode } from "react"

/**
 * Minimal AuthProvider
 * -------------------------------------------------
 * Middleware already guards protected routes, so at
 * runtime we only need a passthrough wrapper that
 * can be expanded later (e.g., to expose Supabase).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
