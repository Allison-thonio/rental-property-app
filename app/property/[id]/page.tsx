import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { PropertyDetails } from "@/components/property-details"
import { ContactForm } from "@/components/contact-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: property } = await supabase.from("properties").select("*").eq("id", id).single()

  if (!property) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PropertyDetails property={property} />
            </div>
            <div className="space-y-4">
              <ContactForm propertyId={id} userId={user?.id} isAuthenticated={!!user} />
              {user && (
                <Link href={`/property/${id}/invest`}>
                  <Button className="w-full" variant="secondary">
                    💰 Invest in this Property
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
