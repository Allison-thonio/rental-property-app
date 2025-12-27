"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "email") {
          setError("Invalid confirmation link")
          setLoading(false)
          return
        }

        const response = await fetch("/api/auth/confirm-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, type }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Failed to confirm email")
          setLoading(false)
          return
        }

        setSuccess(true)
        setLoading(false)

        // Redirect to success page after 3 seconds
        setTimeout(() => {
          router.push("/auth/confirm-success")
        }, 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setLoading(false)
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Confirming Email</CardTitle>
            <CardDescription>Please wait while we verify your email address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}

              {error && (
                <>
                  <p className="text-sm text-red-500 text-center">{error}</p>
                  <Button asChild className="w-full">
                    <Link href="/auth/login">Back to Login</Link>
                  </Button>
                </>
              )}

              {success && (
                <>
                  <p className="text-sm text-green-600 text-center">Email confirmed successfully! Redirecting...</p>
                  <Button asChild className="w-full">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
