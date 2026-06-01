"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { PropertyMap } from "./property-map"

interface Property {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  price: number
  bedrooms: number
  bathrooms: number
  area_sqft: number
  property_type: string
  listing_type: string
  amenities: string[]
  featured_image: string
  images: string[]
  latitude?: number
  longitude?: number
}

export function PropertyDetails({ property }: { property: Property }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative h-96 rounded-lg overflow-hidden bg-muted">
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
        </div>
        {property.images && property.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {property.images.slice(0, 4).map((img: string, idx: number) => (
              <div key={idx} className="relative h-20 rounded overflow-hidden bg-muted cursor-pointer">
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`Property image ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pretty">{property.title}</h1>
            <p className="text-muted-foreground mt-1">
              {property.address}, {property.city}, {property.state}
            </p>
          </div>
          <Badge>{property.property_type}</Badge>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Bedrooms</p>
          <p className="text-2xl font-bold">{property.bedrooms}</p>
        </div>
        <div className="p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Bathrooms</p>
          <p className="text-2xl font-bold">{property.bathrooms}</p>
        </div>
        <div className="p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Area</p>
          <p className="text-2xl font-bold">{property.area_sqft} sqft</p>
        </div>
      </div>

      {/* Price */}
      <div className="p-6 rounded-lg bg-card border">
        <p className="text-sm text-muted-foreground mb-2">Price</p>
        <p className="text-4xl font-bold text-primary">{formatPrice(property.price)}</p>
        <p className="text-sm mt-2">{property.listing_type === "rent" ? "per month" : ""}</p>
      </div>

      {property.latitude && property.longitude && (
        <div>
          <h2 className="text-xl font-bold mb-3">Location</h2>
          <PropertyMap properties={[property]} height="h-64" />
        </div>
      )}

      {/* Description */}
      {property.description && (
        <div>
          <h2 className="text-xl font-bold mb-3">About this property</h2>
          <p className="text-muted-foreground leading-relaxed">{property.description}</p>
        </div>
      )}

      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {property.amenities.map((amenity: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-lg border">
                <span className="text-primary">✓</span>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
