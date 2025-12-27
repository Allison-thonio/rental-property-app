"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function DashboardHeader({ user, profile }: { user: any; profile: any }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome, {profile?.first_name || user.email}</p>
        </div>
        <Link href="/dashboard/new-property">
          <Button>List New Property</Button>
        </Link>
      </div>
    </div>
  )
}
