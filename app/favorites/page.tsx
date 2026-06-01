import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { FavoritesView } from "@/components/favorites-view"

export default async function FavoritesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: favorites = [] } = await supabase
    .from("favorites")
    .select("*,properties(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Saved Properties</h1>
          <FavoritesView favorites={favorites} userId={user.id} />
        </div>
      </main>
    </>
  )
}
