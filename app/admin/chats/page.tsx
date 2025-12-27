"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

const SUSPICIOUS_KEYWORDS = ["western union", "money transfer", "bitcoin", "crypto", "upfront payment", "bank details"]

export default function AdminChatsPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchConversations = async () => {
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

        // Fetch flagged conversations
        const { data } = await supabase
          .from("investor_conversations")
          .select("*,investment:investment_id(property_id),sender:sender_id(first_name,last_name,email)")
          .eq("flagged_by_admin", true)
          .order("created_at", { ascending: false })

        setConversations(data || [])
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [supabase, router])

  const checkSuspiciousContent = (message: string): string[] => {
    const lowerMessage = message.toLowerCase()
    return SUSPICIOUS_KEYWORDS.filter((keyword) => lowerMessage.includes(keyword))
  }

  const handleFlagConversation = async (conversationId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from("investor_conversations")
        .update({ flagged_by_admin: true, admin_flag_reason: reason })
        .eq("id", conversationId)

      if (error) throw error

      setConversations(
        conversations.map((c) =>
          c.id === conversationId ? { ...c, flagged_by_admin: true, admin_flag_reason: reason } : c,
        ),
      )
    } catch (error) {
      console.error("Error flagging conversation:", error)
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
              <h1 className="text-3xl font-bold mb-2">Chat Monitoring</h1>
              <p className="text-muted-foreground">Review flagged investment conversations for scam prevention</p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          {conversations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No flagged conversations at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation: any) => {
                const suspiciousWords = checkSuspiciousContent(conversation.message_text)
                return (
                  <Card key={conversation.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2">
                            <h3 className="font-semibold">
                              {conversation.sender.first_name} {conversation.sender.last_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{conversation.sender.email}</p>
                          </div>
                          <div className="bg-muted p-3 rounded mb-3">
                            <p className="text-sm">{conversation.message_text}</p>
                          </div>
                          {suspiciousWords.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                              <p className="text-xs font-semibold text-red-800">Suspicious keywords detected:</p>
                              <p className="text-xs text-red-700">{suspiciousWords.join(", ")}</p>
                            </div>
                          )}
                          {conversation.admin_flag_reason && (
                            <p className="text-xs text-muted-foreground">
                              Flag reason: {conversation.admin_flag_reason}
                            </p>
                          )}
                        </div>
                        <Link href={`/admin/chats/${conversation.investment_id}`}>
                          <Button size="sm" className="whitespace-nowrap">
                            View Full Chat
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
