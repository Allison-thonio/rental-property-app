"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

export function InquiryItem({ inquiry, userId }: { inquiry: any; userId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkAsReplied = async () => {
    const supabase = createClient()
    setIsLoading(true)
    await supabase.from("inquiries").update({ status: "replied" }).eq("id", inquiry.id)
    setIsLoading(false)
    window.location.reload()
  }

  const getStatusColor = (status: string) => {
    return status === "new" ? "destructive" : status === "replied" ? "default" : "secondary"
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold">{inquiry.name}</h3>
              <p className="text-sm text-muted-foreground">About: {inquiry.properties?.title}</p>
            </div>
            <Badge variant={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
          </div>

          <div className="bg-muted p-3 rounded text-sm">
            <p>{inquiry.message}</p>
          </div>

          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Email: </span>
              <a href={`mailto:${inquiry.email}`} className="text-primary hover:underline">
                {inquiry.email}
              </a>
            </div>
            {inquiry.phone && (
              <div>
                <span className="text-muted-foreground">Phone: </span>
                <a href={`tel:${inquiry.phone}`} className="text-primary hover:underline">
                  {inquiry.phone}
                </a>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleMarkAsReplied} disabled={isLoading || inquiry.status === "replied"}>
              {isLoading ? "Updating..." : "Mark as Replied"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
