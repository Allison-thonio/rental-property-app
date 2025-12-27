"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/components/property-card"
import { Heart, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function FavoritesView({ favorites, userId }: { favorites: any[]; userId: string }) {
  const [favList, setFavList] = useState(favorites)

  const handleRemove = async (favoriteId: string) => {
    const supabase = createClient()
    await supabase.from("favorites").delete().eq("id", favoriteId)
    setFavList(favList.filter((f) => f.id !== favoriteId))
  }

  if (favList.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">You haven't saved any properties yet</p>
        <a href="/">
          <Button>Browse Properties</Button>
        </a>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          You have <span className="font-semibold text-foreground">{favList.length}</span> saved properties
        </p>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favList.map((fav: any) => (
          <div key={fav.id} className="relative group">
            <PropertyCard property={fav.properties} />
            <button
              onClick={() => handleRemove(fav.id)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove from favorites"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <a href="/" className="flex-1">
          <Button className="w-full bg-transparent" variant="outline">
            Continue Browsing
          </Button>
        </a>
        <a href="/messages" className="flex-1">
          <Button className="w-full">View Messages</Button>
        </a>
      </div>
    </div>
  )
}
