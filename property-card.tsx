"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Property {
  id: string
  title: string
  price: number
  city: string
  bedrooms: number
  bathrooms: number
  property_type: string
  listing_type: string
  featured_image: string
}

export function PropertyCard({ property }: { property: Property }) {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (isFavorite) {
      await supabase.from("favorites").delete().match({ user_id: user.id, property_id: property.id })
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: property.id })
    }

    setIsFavorite(!isFavorite)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Link href={`/property/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-0">
          <div className="relative h-48 bg-muted">
            {property.featured_image ? (
              <Image
                src={property.featured_image || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No image available</div>
            )}
            <Badge className="absolute top-2 right-2">{property.listing_type}</Badge>
            <button
              onClick={handleToggleFavorite}
              className="absolute top-2 left-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg text-pretty line-clamp-2">{property.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{property.city}</p>
            <div className="flex gap-3 mt-3 text-sm">
              <span>{property.bedrooms} Beds</span>
              <span>·</span>
              <span>{property.bathrooms} Baths</span>
            </div>
            <p className="text-lg font-bold text-primary mt-3">{formatPrice(property.price)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
