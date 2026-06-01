"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function AdminFraudAlertsPage() {
  const [fraudFlags, setFraudFlags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchFraudFlags = async () => {
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
          .from("fraud_flags")
          .select("*,user:user_id(first_name,last_name,email)")
          .eq("resolved", false)
          .order("created_at", { ascending: false })

        setFraudFlags(data || [])
      } catch (error) {
        console.error("Error fetching fraud flags:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFraudFlags()
  }, [supabase, router])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleResolveFraudFlag = async (flagId: string) => {
    try {
      const { error } = await supabase
        .from("fraud_flags")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", flagId)

      if (error) throw error

      setFraudFlags(fraudFlags.filter((f) => f.id !== flagId))
    } catch (error) {
      console.error("Error resolving fraud flag:", error)
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
              <h1 className="text-3xl font-bold mb-2">Fraud Detection Alerts</h1>
              <p className="text-muted-foreground">Review and resolve suspicious activity flags</p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          {fraudFlags.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No active fraud flags at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {fraudFlags.map((flag: any) => (
                <Card key={flag.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {flag.user.first_name} {flag.user.last_name}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                            {flag.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{flag.user.email}</p>
                        <div className="bg-muted p-3 rounded">
                          <p className="text-sm">
                            <span className="font-medium">Flag Type:</span> {flag.flag_type.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">Details:</span> {flag.description}
                          </p>
                          {flag.automated && <p className="text-xs text-muted-foreground mt-1">Automated detection</p>}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleResolveFraudFlag(flag.id)}
                        className="whitespace-nowrap"
                      >
                        Resolve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
