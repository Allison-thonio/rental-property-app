import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { PropertyForm } from "@/components/property-form"

interface EditPropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: property } = await supabase.from("properties").select("*").eq("id", id).single()

  if (!property || property.seller_id !== user.id) {
    redirect("/dashboard")
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Edit Property</h1>
          <PropertyForm userId={user.id} propertyId={id} />
        </div>
      </main>
    </>
  )
}
