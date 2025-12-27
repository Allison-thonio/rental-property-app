import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reply_message } = await request.json()

    // Verify the user owns the property this inquiry is about
    const { data: inquiry } = await supabase.from("inquiries").select("*,properties(seller_id)").eq("id", id).single()

    if (!inquiry || (inquiry as any).properties.seller_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create a message reply
    const { error: messageError } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: (inquiry as any).sender_id,
      message_text: reply_message,
      property_id: (inquiry as any).property_id,
    })

    if (messageError) throw messageError

    // Update inquiry status
    const { error: updateError } = await supabase.from("inquiries").update({ status: "replied" }).eq("id", id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error replying to inquiry:", error)
    return NextResponse.json({ error: "Failed to reply to inquiry" }, { status: 500 })
  }
}
