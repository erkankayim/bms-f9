import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  // This client uses the SERVICE_ROLE_KEY for server-side operations.
  // This is crucial for bypassing Row Level Security (RLS) policies when
  // server actions need to fetch data like the full customer list.
  // This is secure as it only runs on the server.
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}

// Alias for backward compatibility
export const createSupabaseServerClient = createClient
