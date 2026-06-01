import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { InquiriesView } from "@/components/inquiries-view"

export default async function InquiriesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get inquiries sent by this user
  const { data: sentInquiries = [] } = await supabase
    .from("inquiries")
    .select("*,properties(*)")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">My Inquiries</h1>
          <InquiriesView inquiries={sentInquiries} currentUserId={user.id} />
        </div>
      </main>
    </>
  )
}
