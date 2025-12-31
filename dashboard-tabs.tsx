"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyListItem } from "@/components/property-list-item"
import { InquiryItem } from "@/components/inquiry-item"
import { Card } from "@/components/ui/card"

export function DashboardTabs({
  properties,
  inquiries,
  userId,
}: {
  properties: any[]
  inquiries: any[]
  userId: string
}) {
  const [activeTab, setActiveTab] = useState("properties")

  const newInquiries = inquiries.filter((i: any) => i.status === "new")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="properties">My Properties ({properties.length})</TabsTrigger>
        <TabsTrigger value="inquiries">
          Inquiries{" "}
          {newInquiries.length > 0 && (
            <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{newInquiries.length}</span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="properties" className="space-y-4 mt-6">
        {properties.length > 0 ? (
          <div className="space-y-3">
            {properties.map((property: any) => (
              <PropertyListItem key={property.id} property={property} userId={userId} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't listed any properties yet</p>
            <a href="/dashboard/new-property">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                Create Your First Listing
              </button>
            </a>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="inquiries" className="space-y-4 mt-6">
        {inquiries.length > 0 ? (
          <div className="space-y-3">
            {inquiries.map((inquiry: any) => (
              <InquiryItem key={inquiry.id} inquiry={inquiry} userId={userId} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No inquiries yet</p>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
