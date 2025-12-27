import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token, type } = await request.json()

    if (!token || type !== "email") {
      return NextResponse.json({ error: "Invalid token or type" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Handle cookie setting errors
            }
          },
        },
      },
    )

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    })

    if (error || !data) {
      console.error("Email confirmation error:", error)
      return NextResponse.json({ error: "Failed to confirm email. Token may have expired." }, { status: 400 })
    }

    return NextResponse.json({
      message: "Email confirmed successfully",
      user: data.user,
    })
  } catch (error) {
    console.error("Confirmation route error:", error)
    return NextResponse.json({ error: "An error occurred during email confirmation" }, { status: 500 })
  }
}
