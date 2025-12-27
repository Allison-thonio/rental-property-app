"use client"

import { PropertyCard } from "@/components/property-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ListingsPage({ properties }: { properties: any[] }) {
  if (properties.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">No properties found matching your search</p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((p: any) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  )
}
