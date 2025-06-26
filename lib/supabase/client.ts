import { createBrowserClient } from "@supabase/ssr"

// Create a singleton Supabase client for client-side components
let client: ReturnType<typeof createBrowserClient> | undefined

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  return client
}

// Alias for backward compatibility and easier usage
export const createClient = getSupabaseBrowserClient
