"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchLogs = async () => {
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

        const { data } = await supabase
          .from("admin_logs")
          .select("*,admin:admin_id(first_name,last_name),target_user:target_user_id(first_name,last_name,email)")
          .order("created_at", { ascending: false })
          .limit(100)

        setLogs(data || [])
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [supabase, router])

  const getActionColor = (action: string) => {
    switch (action) {
      case "account_banned":
        return "text-red-600"
      case "account_verified":
        return "text-green-600"
      case "document_approved":
        return "text-green-600"
      case "document_rejected":
        return "text-red-600"
      case "chat_flagged":
        return "text-yellow-600"
      case "fraud_alert":
        return "text-red-600"
      default:
        return "text-gray-600"
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
              <h1 className="text-3xl font-bold mb-2">Admin Audit Logs</h1>
              <p className="text-muted-foreground">Complete record of all admin actions</p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Admin</th>
                      <th className="text-left py-3 px-4 font-semibold">Action</th>
                      <th className="text-left py-3 px-4 font-semibold">Target User</th>
                      <th className="text-left py-3 px-4 font-semibold">Details</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: any) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {log.admin ? `${log.admin.first_name} ${log.admin.last_name}` : "System"}
                        </td>
                        <td className={`py-3 px-4 font-medium ${getActionColor(log.action_type)}`}>
                          {log.action_type.replace(/_/g, " ").toUpperCase()}
                        </td>
                        <td className="py-3 px-4">
                          {log.target_user ? (
                            <div>
                              <p>
                                {log.target_user.first_name} {log.target_user.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">{log.target_user.email}</p>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">{log.details}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
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
