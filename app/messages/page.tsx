import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { MessagesView } from "@/components/messages-view"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all conversations (both sent and received)
  const { data: sentMessages = [] } = await supabase
    .from("messages")
    .select(
      "*,receiver:receiver_id(first_name,last_name,id),sender:sender_id(first_name,last_name,id),property:property_id(title,id)",
    )
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })

  const { data: receivedMessages = [] } = await supabase
    .from("messages")
    .select(
      "*,receiver:receiver_id(first_name,last_name,id),sender:sender_id(first_name,last_name,id),property:property_id(title,id)",
    )
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false })

  const allMessages = [...sentMessages, ...receivedMessages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  // Group by conversation (user pair)
  const conversations = new Map()
  allMessages.forEach((msg: any) => {
    const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender
    const key = [msg.sender_id, msg.receiver_id].sort().join("|")

    if (!conversations.has(key)) {
      conversations.set(key, {
        otherUser,
        lastMessage: msg,
        messages: [],
      })
    }
    conversations.get(key).messages.push(msg)
  })

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Messages</h1>
          <MessagesView conversations={Array.from(conversations.values())} currentUserId={user.id} />
        </div>
      </main>
    </>
  )
}
