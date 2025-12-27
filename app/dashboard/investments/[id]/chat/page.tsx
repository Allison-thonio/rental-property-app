"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"

export default function InvestmentChatPage() {
  const params = useParams()
  const investmentId = params.id as string
  const [messages, setMessages] = useState<any[]>([])
  const [investment, setInvestment] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

        setCurrentUserId(user.id)

        // Fetch investment details
        const { data: inv } = await supabase
          .from("investments")
          .select(
            "*,property:property_id(title),investor:investor_id(first_name,last_name),seller:seller_id(first_name,last_name)",
          )
          .eq("id", investmentId)
          .single()

        setInvestment(inv)

        // Fetch messages
        const { data } = await supabase
          .from("investor_conversations")
          .select("*,sender:sender_id(first_name,last_name,id)")
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId) return

    setIsSending(true)

    try {
      const response = await fetch(`/api/investments/${investmentId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_text: newMessage }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const message = await response.json()
      setMessages([...messages, message])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading || !investment) return <div>Loading...</div>

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>{investment.property.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Investment: ₦{investment.investment_amount.toLocaleString()} •
                {investment.investment_type === "fixed_return" && ` ${investment.expected_return}% return`}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages */}
                <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-muted/30">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
                  ) : (
                    messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`mb-4 flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`px-4 py-2 rounded-lg max-w-xs ${
                            msg.sender_id === currentUserId
                              ? "bg-blue-500 text-white"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <p className="text-sm font-medium mb-1">
                            {msg.sender.first_name} {msg.sender.last_name}
                          </p>
                          <p className="text-sm">{msg.message_text}</p>
                          {msg.flagged_by_admin && (
                            <p className="text-xs mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                              ⚠️ Flagged by admin
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                  />
                  <Button type="submit" disabled={isSending || !newMessage.trim()}>
                    {isSending ? "Sending..." : "Send"}
                  </Button>
                </form>

                <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded">
                  ℹ️ This conversation is monitored for fraud prevention. Suspicious activity will be flagged.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
