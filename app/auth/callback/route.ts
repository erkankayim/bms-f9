import type { EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/"

  if (token_hash && type) {
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Hata durumunda veya token yoksa login sayfasına yönlendir
  console.error("Auth callback error or missing token/type", { token_hash, type })
  const redirectUrl = new URL("/auth/login", request.url)
  redirectUrl.searchParams.set("message", "E-posta doğrulama linki geçersiz veya süresi dolmuş.")
  return NextResponse.redirect(redirectUrl)
}
