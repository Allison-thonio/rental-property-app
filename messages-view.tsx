"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export function MessagesView({ conversations, currentUserId }: { conversations: any[]; currentUserId: string }) {
  const [selectedConversation, setSelectedConversation] = useState<any>(null)

  if (conversations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">No messages yet</p>
        <Link href="/">
          <Button>Browse Properties</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversation List */}
      <div className="lg:col-span-1">
        <div className="space-y-2 border rounded-lg overflow-hidden">
          {conversations.map((conv: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full text-left p-4 border-b last:border-b-0 hover:bg-muted transition-colors ${
                selectedConversation === conv ? "bg-muted" : ""
              }`}
            >
              <p className="font-semibold text-sm">
                {conv.otherUser.first_name} {conv.otherUser.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-1">{conv.lastMessage.message_text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(conv.lastMessage.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat View */}
      <div className="lg:col-span-2">
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} currentUserId={currentUserId} />
        ) : (
          <Card className="p-12 text-center h-full flex items-center justify-center">
            <p className="text-muted-foreground">Select a conversation to view messages</p>
          </Card>
        )}
      </div>
    </div>
  )
}

function ChatWindow({ conversation, currentUserId }: { conversation: any; currentUserId: string }) {
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsLoading(true)

    // In a real app, you would:
    // 1. Send the message to Supabase
    // 2. Update the UI optimistically
    // 3. Handle errors

    setNewMessage("")
    setIsLoading(false)
  }

  const otherUser = conversation.otherUser

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <CardHeader className="border-b">
        <p className="font-semibold">
          {otherUser.first_name} {otherUser.last_name}
        </p>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages
          .slice()
          .reverse()
          .map((msg: any, idx: number) => (
            <div key={idx} className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm break-words">{msg.message_text}</p>
                <p className="text-xs mt-1 opacity-70">{new Date(msg.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            Send
          </Button>
        </form>
      </div>
    </Card>
  )
}
