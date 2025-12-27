"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import Link from "next/link"

export function ContactForm({
  propertyId,
  userId,
  isAuthenticated,
}: {
  propertyId: string
  userId?: string
  isAuthenticated: boolean
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) return

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("inquiries").insert({
        property_id: propertyId,
        sender_id: userId,
        name,
        email,
        phone,
        message,
        inquiry_type: "general",
      })

      if (error) throw error
      setSubmitted(true)
      setName("")
      setEmail("")
      setPhone("")
      setMessage("")
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error("Error submitting inquiry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle>Interested in this property?</CardTitle>
          <CardDescription>Sign in to contact the seller</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Link href="/auth/login" className="flex-1">
              <Button className="w-full">Login</Button>
            </Link>
            <Link href="/auth/sign-up" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Sign Up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Contact Seller</CardTitle>
        <CardDescription>Get in touch about this property</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm min-h-24"
              placeholder="Tell us why you're interested..."
              required
            />
          </div>
          {submitted && <p className="text-sm text-green-600">Message sent successfully!</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Inquiry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
