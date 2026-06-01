import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const SUSPICIOUS_KEYWORDS = ["western union", "money transfer", "bitcoin", "crypto", "upfront payment", "bank details"]

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

    const { message_text } = await request.json()

    if (!message_text) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Verify user is part of this investment
    const { data: investment } = await supabase.from("investments").select("*").eq("id", id).single()

    if (!investment || (investment.investor_id !== user.id && investment.seller_id !== user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check for suspicious content
    let shouldFlag = false
    const lowerMessage = message_text.toLowerCase()
    const detectedKeywords = SUSPICIOUS_KEYWORDS.filter((keyword) => lowerMessage.includes(keyword))

    if (detectedKeywords.length > 0) {
      shouldFlag = true
    }

    // Insert message
    const { data, error } = await supabase
      .from("investor_conversations")
      .insert({
        investment_id: id,
        property_id: investment.property_id,
        sender_id: user.id,
        message_text,
        flagged_by_admin: shouldFlag,
        admin_flag_reason: shouldFlag ? `Suspicious keywords: ${detectedKeywords.join(", ")}` : null,
      })
      .select()
      .single()

    if (error) throw error

    // If flagged, create fraud flag entry
    if (shouldFlag) {
      const { data: otherUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", investment.investor_id === user.id ? investment.seller_id : investment.investor_id)
        .single()

      await supabase.from("fraud_flags").insert({
        user_id: user.id,
        flag_type: "chat_suspicious_words",
        severity: "medium",
        description: `Suspicious keywords in investment chat: ${detectedKeywords.join(", ")}`,
        automated: true,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is part of this investment
    const { data: investment } = await supabase.from("investments").select("*").eq("id", id).single()

    if (!investment || (investment.investor_id !== user.id && investment.seller_id !== user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("investor_conversations")
      .select("*,sender:sender_id(first_name,last_name,id)")
      .eq("investment_id", id)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 })
  }
}
