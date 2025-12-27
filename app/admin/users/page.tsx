"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

        if (!profile?.is_admin) {
          router.push("/")
          return
        }

        setIsAdmin(true)

        const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50)

        setUsers(data || [])
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [supabase, router])

  const handleBanUser = async (userId: string, banReason: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: banReason,
          ban_date: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      setUsers(users.map((u) => (u.id === userId ? { ...u, is_banned: true, ban_reason: banReason } : u)))
    } catch (error) {
      console.error("Error banning user:", error)
    }
  }

  const handleVerifyUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ verification_status: "verified" }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((u) => (u.id === userId ? { ...u, verification_status: "verified" } : u)))
    } catch (error) {
      console.error("Error verifying user:", error)
    }
  }

  if (!isAdmin || isLoading) return <div>Loading...</div>

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">User Management</h1>
              <p className="text-muted-foreground">Review and manage user accounts</p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Verification</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4 text-sm">{user.user_type}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.verification_status === "verified"
                                ? "bg-green-100 text-green-800"
                                : user.verification_status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.verification_status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.is_banned ? (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              Banned
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          {!user.is_banned && (
                            <>
                              {user.verification_status !== "verified" && (
                                <Button size="sm" onClick={() => handleVerifyUser(user.id)} className="text-xs">
                                  Verify
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBanUser(user.id, "Suspicious activity detected")}
                                className="text-xs"
                              >
                                Ban
                              </Button>
                            </>
                          )}
                          <Link href={`/admin/users/${user.id}`}>
                            <Button size="sm" variant="outline" className="text-xs bg-transparent">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
