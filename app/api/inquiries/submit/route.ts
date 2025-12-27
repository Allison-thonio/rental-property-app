import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { property_id, name, email, phone, message, inquiry_type } = await request.json()

    if (!property_id || !name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase.from("inquiries").insert({
      property_id,
      sender_id: user?.id || null,
      name,
      email,
      phone,
      message,
      inquiry_type: inquiry_type || "general",
    })

    if (error) throw error

    // Optionally create a message in the messages table if user is authenticated
    if (user) {
      const { data: property } = await supabase.from("properties").select("seller_id").eq("id", property_id).single()

      if (property) {
        await supabase.from("messages").insert({
          sender_id: user.id,
          receiver_id: property.seller_id,
          message_text: message,
          property_id,
        })
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error submitting inquiry:", error)
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 })
  }
}
