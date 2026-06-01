import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { receiver_id, message_text, property_id } = await request.json()

    const { data, error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id,
      message_text,
      property_id,
    })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
