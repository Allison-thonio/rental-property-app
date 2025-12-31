"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface LocationPickerProps {
  latitude?: number
  longitude?: number
  onLocationChange: (lat: number, lng: number) => void
}

export function LocationPicker({ latitude = 6.5244, longitude = 3.3792, onLocationChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ lat: latitude, lng: longitude })

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 12)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    // Add initial marker
    const marker = L.marker([coords.lat, coords.lng], {
      icon: L.icon({
        iconUrl:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233b82f6'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'/%3E%3C/svg%3E",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
      draggable: true,
    }).addTo(map)

    // Update coordinates when marker is dragged
    marker.on("drag", (e) => {
      const pos = e.target.getLatLng()
      setCoords({ lat: pos.lat, lng: pos.lng })
      onLocationChange(pos.lat, pos.lng)
    })

    // Update marker when map is clicked
    map.on("click", (e) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      setCoords({ lat, lng })
      onLocationChange(lat, lng)
    })

    markerRef.current = marker
    mapRef.current = map

    return () => {
      map.remove()
    }
  }, [])

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>, type: "lat" | "lng") => {
    const value = Number.parseFloat(e.target.value) || 0
    const newCoords = { ...coords, [type === "lat" ? "lat" : "lng"]: value }
    setCoords(newCoords)

    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([newCoords.lat, newCoords.lng])
      mapRef.current.setView([newCoords.lat, newCoords.lng], 12)
      onLocationChange(newCoords.lat, newCoords.lng)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Location on Map</Label>
        <p className="text-sm text-muted-foreground mb-2">Click on the map or drag the marker to set location</p>
        <div ref={mapContainerRef} className="h-64 rounded-lg border border-border overflow-hidden" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            value={coords.lat.toFixed(6)}
            onChange={(e) => handleCoordinateChange(e, "lat")}
            step="0.000001"
            placeholder="0.0000"
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            value={coords.lng.toFixed(6)}
            onChange={(e) => handleCoordinateChange(e, "lng")}
            step="0.000001"
            placeholder="0.0000"
          />
        </div>
      </div>
    </div>
  )
}
