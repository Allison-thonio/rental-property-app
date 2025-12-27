import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const SUSPICIOUS_PATTERNS = {
  multiple_rejected_docs: async (userId: string, supabase: any) => {
    const { count } = await supabase
      .from("documents")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("verification_status", "rejected")

    return (count || 0) >= 2
  },

  rapid_escalation: async (userId: string, supabase: any) => {
    const { data } = await supabase
      .from("investments")
      .select("created_at")
      .eq("investor_id", userId)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    return (data?.length || 0) >= 3
  },

  unverified_claims: async (userId: string, supabase: any) => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

    const { count: approvedDocs } = await supabase
      .from("documents")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("verification_status", "approved")

    return profile?.user_type === "investor" && (approvedDocs || 0) === 0
  },
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()

    // Run fraud detection patterns
    const flags: string[] = []

    for (const [patternName, patternCheck] of Object.entries(SUSPICIOUS_PATTERNS)) {
      try {
        if (await patternCheck(userId, supabase)) {
          flags.push(patternName)

          // Create fraud flag
          await supabase.from("fraud_flags").insert({
            user_id: userId,
            flag_type: patternName,
            severity: patternName === "multiple_rejected_docs" ? "high" : "medium",
            description: `Automated detection: ${patternName.replace(/_/g, " ")}`,
            automated: true,
          })
        }
      } catch (error) {
        console.error(`Error checking pattern ${patternName}:`, error)
      }
    }

    return NextResponse.json({ flags, count: flags.length })
  } catch (error) {
    console.error("Error in fraud detection:", error)
    return NextResponse.json({ error: "Failed to run fraud detection" }, { status: 500 })
  }
}
