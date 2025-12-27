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

    const { property_id, action } = await request.json()

    if (action === "add") {
      const { data, error } = await supabase.from("favorites").insert({
        user_id: user.id,
        property_id,
      })

      if (error && error.code !== "23505") throw error // 23505 is unique constraint violation
      return NextResponse.json({ success: true, isFavorite: true, data })
    } else if (action === "remove") {
      const { error } = await supabase.from("favorites").delete().match({ user_id: user.id, property_id })

      if (error) throw error
      return NextResponse.json({ success: true, isFavorite: false })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 })
  }
}
