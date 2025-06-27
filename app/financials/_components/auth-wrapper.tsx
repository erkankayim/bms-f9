"use client"

import type { ReactNode } from "react"

/**
 * Temporary no-op wrapper.
 * Old pages that still import AuthWrapper will compile
 * until we finish migrating them to middleware-only auth.
 */
export function AuthWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>
}
