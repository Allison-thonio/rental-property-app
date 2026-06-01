import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/components/property-card"
import { Navigation } from "@/components/navigation"
import { SearchBar } from "@/components/search-bar"
import { PropertyMap } from "@/components/property-map"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: properties = [] } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(12)

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-pretty">Find Your Perfect Property</h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Buy, rent, or find a shortlet that matches your lifestyle
                </p>
              </div>
              <SearchBar />
            </div>
          </div>
        </section>

        <section className="border-b bg-background py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Properties Near You</h2>
              <p className="text-muted-foreground">Explore available properties on the map</p>
            </div>
            {properties.length > 0 ? (
              <PropertyMap properties={properties} height="h-96" />
            ) : (
              <div className="h-96 border rounded-lg flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">No properties available on map</p>
              </div>
            )}
          </div>
        </section>

        {/* Filter Section */}
        <section className="border-b bg-background">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              <Button variant="outline">All</Button>
              <Button variant="outline">Buy</Button>
              <Button variant="outline">Rent</Button>
              <Button variant="outline">Shortlet</Button>
            </div>
          </div>
        </section>

        {/* Listings Grid */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          {properties.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">Featured Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No properties available yet</p>
              <Link href="/auth/sign-up">
                <Button>List a Property</Button>
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
