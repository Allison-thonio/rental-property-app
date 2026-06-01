import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: properties = [] } = await supabase
    .from("properties")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  const { data: inquiries = [] } = await supabase
    .from("inquiries")
    .select("*,properties(*)")
    .in(
      "property_id",
      properties.map((p: any) => p.id),
    )
    .order("created_at", { ascending: false })

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <DashboardHeader user={user} profile={profile} />
          <DashboardTabs properties={properties} inquiries={inquiries} userId={user.id} />
        </div>
      </main>
    </>
  )
}
