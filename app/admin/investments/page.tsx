"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchInvestments = async () => {
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
          .from("investments")
          .select(
            "*,property:property_id(title),investor:investor_id(first_name,last_name,email),seller:seller_id(first_name,last_name,email)",
          )
          .order("created_at", { ascending: false })

        setInvestments(data || [])
      } catch (error) {
        console.error("Error fetching investments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestments()
  }, [supabase, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "proposed":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
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
              <h1 className="text-3xl font-bold mb-2">Investment Tracking</h1>
              <p className="text-muted-foreground">Monitor all active investments on the platform</p>
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
                      <th className="text-left py-3 px-4 font-semibold">Property</th>
                      <th className="text-left py-3 px-4 font-semibold">Investor</th>
                      <th className="text-left py-3 px-4 font-semibold">Seller</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv: any) => (
                      <tr key={inv.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{inv.property.title}</td>
                        <td className="py-3 px-4">
                          <p>
                            {inv.investor.first_name} {inv.investor.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{inv.investor.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p>
                            {inv.seller.first_name} {inv.seller.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{inv.seller.email}</p>
                        </td>
                        <td className="py-3 px-4">₦{inv.investment_amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-xs">
                          {inv.investment_type.charAt(0).toUpperCase() + inv.investment_type.slice(1)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(inv.status)}`}>
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{inv.investment_term_months} months</td>
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
