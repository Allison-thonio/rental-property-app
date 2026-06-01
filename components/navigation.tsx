"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(data)
      }

      setIsLoading(false)
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push("/")
  }

  return (
    <nav className="border-b bg-card">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          PropertyHub
        </Link>

        <div className="flex items-center gap-2">
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  {(profile?.user_type === "investor" || profile?.user_type === "both") && (
                    <Link href="/dashboard/investments">
                      <Button variant="ghost" size="sm">
                        Investments
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard/documents">
                    <Button variant="ghost" size="sm">
                      Documents
                    </Button>
                  </Link>
                  <Link href="/favorites">
                    <Button variant="ghost" size="sm">
                      Saved
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="ghost" size="sm">
                      Messages
                    </Button>
                  </Link>
                  <Link href="/inquiries">
                    <Button variant="ghost" size="sm">
                      Inquiries
                    </Button>
                  </Link>
                  {profile?.is_admin && (
                    <Link href="/admin/dashboard">
                      <Button variant="default" size="sm">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button size="sm" variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
