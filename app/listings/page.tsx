import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { ListingsPage } from "@/components/listings-page"

export default async function SearchListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; city?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from("properties").select("*").eq("status", "available")

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,city.ilike.%${params.search}%,address.ilike.%${params.search}%`)
  }

  if (params.type) {
    query = query.eq("listing_type", params.type)
  }

  if (params.city) {
    query = query.ilike("city", `%${params.city}%`)
  }

  const { data: properties = [] } = await query.order("created_at", { ascending: false })

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">
            {params.search ? `Results for "${params.search}"` : "All Properties"}
          </h1>
          <ListingsPage properties={properties} />
        </div>
      </main>
    </>
  )
}
