"use client"

import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function AdminChatPage() {
  const params = useParams()
  const investmentId = params.investmentId as string
  const [messages, setMessages] = useState<any[]>([])
  const [investment, setInvestment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch investment
        const { data: inv } = await supabase
          .from("investments")
          .select(
            "*,property:property_id(title),investor:investor_id(first_name,last_name,email),seller:seller_id(first_name,last_name,email)",
          )
          .eq("id", investmentId)
          .single()

        setInvestment(inv)

        // Fetch messages
        const { data } = await supabase
          .from("investor_conversations")
          .select("*,sender:sender_id(first_name,last_name,id,email)")
          .eq("investment_id", investmentId)
          .order("created_at", { ascending: true })

        setMessages(data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [investmentId, supabase, router])

  if (!isAdmin || isLoading || !investment) return <div>Loading...</div>

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Investment Chat Review</h1>
              <p className="text-muted-foreground">{investment.property.title}</p>
            </div>
            <Link href="/admin/chats">
              <Button variant="outline">Back</Button>
            </Link>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Investment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Investor</p>
                  <p className="font-semibold">
                    {investment.investor.first_name} {investment.investor.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{investment.investor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seller</p>
                  <p className="font-semibold">
                    {investment.seller.first_name} {investment.seller.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{investment.seller.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">₦{investment.investment_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type & Term</p>
                  <p className="font-semibold">
                    {investment.investment_type} • {investment.investment_term_months} months
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-muted/30">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground">No messages</p>
                ) : (
                  messages.map((msg: any) => (
                    <div key={msg.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-sm">
                          {msg.sender.first_name} {msg.sender.last_name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{msg.message_text}</p>
                      {msg.flagged_by_admin && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <p className="text-xs font-semibold text-yellow-800">⚠️ Flagged: {msg.admin_flag_reason}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
