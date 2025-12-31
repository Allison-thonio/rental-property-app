"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function InquiriesView({ inquiries, currentUserId }: { inquiries: any[]; currentUserId: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "destructive"
      case "replied":
        return "default"
      case "archived":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (inquiries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">You haven't sent any inquiries yet</p>
        <Link href="/">
          <Button>Browse Properties</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry: any) => (
        <Card key={inquiry.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg">{inquiry.properties?.title}</CardTitle>
                <CardDescription className="mt-1">{inquiry.properties?.city}</CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={getStatusColor(inquiry.status)}>
                  {inquiry.status === "replied" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {inquiry.status}
                </Badge>
                <p className="text-xs text-muted-foreground">{new Date(inquiry.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold mb-1">Your Message</p>
                <p className="text-sm bg-muted p-3 rounded">{inquiry.message}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sent from: </span>
                  {inquiry.email}
                </div>
                {inquiry.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    {inquiry.phone}
                  </div>
                )}
              </div>
              <Link href="/messages">
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  View Messages
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
