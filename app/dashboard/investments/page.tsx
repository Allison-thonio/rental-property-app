"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

        const { data } = await supabase
          .from("investments")
          .select("*,property:property_id(title),seller:seller_id(first_name,last_name)")
          .or(`investor_id.eq.${user.id},seller_id.eq.${user.id}`)
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

  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Investments</h1>
            <p className="text-muted-foreground">Manage your investment proposals and active investments</p>
          </div>

          {investments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No investments yet</p>
                <Link href="/listings">
                  <Button>Browse Properties to Invest</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {investments.map((investment: any) => (
                <Card key={investment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{investment.property.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Investment: ₦{investment.investment_amount.toLocaleString()} •
                          {investment.investment_type.charAt(0).toUpperCase() + investment.investment_type.slice(1)} •
                          {investment.investment_term_months} months
                        </p>
                        {investment.investment_type === "fixed_return" && investment.expected_return && (
                          <p className="text-sm text-muted-foreground">
                            Expected Return: {investment.expected_return}% annually
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(investment.status)}`}
                        >
                          {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                        </span>
                        <Link href={`/dashboard/investments/${investment.id}/chat`}>
                          <Button size="sm">Chat</Button>
                        </Link>
                      </div>
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
