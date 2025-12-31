"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function PropertyListItem({ property, userId }: { property: any; userId: string }) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property?")) return

    const supabase = createClient()
    await supabase.from("properties").delete().eq("id", property.id)
    window.location.reload()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative h-24 w-32 rounded overflow-hidden bg-muted flex-shrink-0">
            {property.featured_image ? (
              <Image
                src={property.featured_image || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No image</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-pretty line-clamp-1">{property.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {property.city}, {property.state}
                </p>
              </div>
              <Badge>{property.listing_type}</Badge>
            </div>
            <div className="flex gap-4 mt-2 text-sm">
              <span>{property.bedrooms} Beds</span>
              <span>{property.bathrooms} Baths</span>
              <span>{property.area_sqft} sqft</span>
            </div>
            <p className="text-lg font-bold text-primary mt-2">{formatPrice(property.price)}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/edit-property/${property.id}`}>
              <Button size="sm" variant="outline">
                <Edit2 className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
