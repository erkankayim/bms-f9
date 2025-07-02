import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  // Kullanıcı oturumunu kontrol et
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth sayfaları ve statik dosyalar için kontrol
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isStaticFile = request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
  const isNextStatic = request.nextUrl.pathname.startsWith("/_next")
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")

  // Statik dosyalar ve API routes için middleware'i atla
  if (isStaticFile || isNextStatic || isApiRoute) {
    return response
  }

  // Kullanıcı giriş yapmamışsa
  if (!session) {
    // Auth sayfasında değilse login'e yönlendir
    if (!isAuthPage) {
      const redirectUrl = new URL("/auth/login", request.url)
      return NextResponse.redirect(redirectUrl)
    }
    // Auth sayfasındaysa devam et
    return response
  }

  // Kullanıcı giriş yapmışsa
  if (session) {
    // Auth sayfasındaysa ana sayfaya yönlendir (sadece ilk giriş için)
    if (isAuthPage) {
      const redirectUrl = new URL("/", request.url)
      return NextResponse.redirect(redirectUrl)
    }
    // Diğer sayfalarda devam et - sekme değiştirme durumunda yönlendirme yapma
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
