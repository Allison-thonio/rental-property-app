"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    bannedAccounts: 0,
    pendingVerifications: 0,
    flaggedConversations: 0,
    activeInvestments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        // Check if user is admin
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

        if (!profile?.is_admin) {
          router.push("/")
          return
        }

        setIsAdmin(true)

        // Fetch statistics
        const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact" })

        const { count: bannedAccounts } = await supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("is_banned", true)

        const { count: pendingVerifications } = await supabase
          .from("documents")
          .select("*", { count: "exact" })
          .eq("verification_status", "pending")

        const { count: flaggedConversations } = await supabase
          .from("investor_conversations")
          .select("*", { count: "exact" })
          .eq("flagged_by_admin", true)

        const { count: activeInvestments } = await supabase
          .from("investments")
          .select("*", { count: "exact" })
          .eq("status", "active")

        setStats({
          totalUsers: totalUsers || 0,
          bannedAccounts: bannedAccounts || 0,
          pendingVerifications: pendingVerifications || 0,
          flaggedConversations: flaggedConversations || 0,
          activeInvestments: activeInvestments || 0,
        })
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminData()
  }, [supabase, router])

  if (!isAdmin || isLoading) return <div>Loading...</div>

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage the platform</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-600">Banned Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.bannedAccounts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-yellow-600">Pending Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingVerifications}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-600">Flagged Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.flaggedConversations}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-600">Active Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.activeInvestments}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Verification</CardTitle>
                <CardDescription>Review pending user documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/documents">
                  <Button className="w-full">Review Documents</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Ban or verify suspicious accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/users">
                  <Button className="w-full">Manage Users</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fraud Detection</CardTitle>
                <CardDescription>View flagged accounts and suspicious activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/fraud-alerts">
                  <Button className="w-full">View Fraud Alerts</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chat Monitoring</CardTitle>
                <CardDescription>Review flagged investment conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/chats">
                  <Button className="w-full">Monitor Chats</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Logs</CardTitle>
                <CardDescription>View all admin actions and audit trail</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/logs">
                  <Button className="w-full">View Logs</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Tracking</CardTitle>
                <CardDescription>Monitor all active investments</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/investments">
                  <Button className="w-full">View Investments</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
