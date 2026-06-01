"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Property {
  id: string
  title: string
  price: number
  address: string
  city: string
  latitude?: number
  longitude?: number
  listing_type: string
  property_type: string
}

interface PropertyMapProps {
  properties: Property[]
  onPropertyClick?: (propertyId: string) => void
  height?: string
}

export function PropertyMap({ properties, onPropertyClick, height = "h-96" }: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map with Lagos as default center (Nigeria's main real estate hub)
    const map = L.map(mapContainerRef.current).setView([6.5244, 3.3792], 10)

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    // Custom icon colors for different listing types
    const iconColors: Record<string, string> = {
      buy: "#3b82f6", // blue
      rent: "#10b981", // green
      shortlet: "#f59e0b", // amber
    }

    // Add property markers
    const markers: L.Marker[] = []
    const bounds = L.latLngBounds([])

    properties.forEach((property) => {
      // Skip properties without coordinates
      if (!property.latitude || !property.longitude) return

      const color = iconColors[property.listing_type] || "#6b7280"

      // Create custom HTML icon
      const iconHtml = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
             style="background-color: ${color}; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          ${property.listing_type === "buy" ? "🏠" : property.listing_type === "rent" ? "🔑" : "🏨"}
        </div>
      `

      const marker = L.marker([property.latitude, property.longitude], {
        icon: L.divIcon({
          html: iconHtml,
          iconSize: [32, 32],
          className: "cursor-pointer",
        }),
      })

      // Popup with property details
      const popupContent = `
        <div class="p-2 bg-white rounded-lg">
          <h3 class="font-bold text-sm">${property.title}</h3>
          <p class="text-xs text-gray-600">${property.address}, ${property.city}</p>
          <p class="text-sm font-bold text-blue-600 mt-1">₦${property.price.toLocaleString()}</p>
          <p class="text-xs capitalize">${property.listing_type} • ${property.property_type}</p>
          <button onclick="window.location.href='/property/${property.id}'" 
                  class="mt-2 w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
            View Details
          </button>
        </div>
      `

      marker.bindPopup(popupContent)

      // Click handler
      if (onPropertyClick) {
        marker.on("click", () => {
          onPropertyClick(property.id)
        })
      }

      marker.addTo(map)
      markers.push(marker)
      bounds.extend([property.latitude, property.longitude])
    })

    // Fit map to all markers if any exist
    if (markers.length > 0) {
      map.fitBounds(bounds.pad(0.1))
    }

    mapRef.current = map

    // Cleanup
    return () => {
      map.remove()
    }
  }, [properties, onPropertyClick])

  return (
    <div
      ref={mapContainerRef}
      className={`${height} w-full rounded-lg border border-border overflow-hidden shadow-md`}
    />
  )
}
