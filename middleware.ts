import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Global middleware to protect pages with Supabase Auth.
 * – Un-authenticated users are redirected to /auth/login
 * – Authenticated users trying to reach /auth/* pages are redirected to /
 */
export async function middleware(request: NextRequest) {
  // Prepare a blank NextResponse we can modify
  const response = NextResponse.next()

  // Create a Supabase server client that reads / writes auth cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // Read the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Skip static assets and Next.js internals
  const isAsset = pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json|txt)$/)
  const isNextInternal = pathname.startsWith("/_next")
  if (isAsset || isNextInternal) {
    return response
  }

  const isAuthRoute = pathname.startsWith("/auth")

  // Not logged in → redirect everything except /auth/* to login
  if (!session && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Logged in → redirect /auth/* pages to dashboard
  if (session && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Default: allow the request through
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
