"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"

export default function UploadDocumentPage() {
  const searchParams = useSearchParams()
  const documentType = searchParams.get("type") || "national_id"
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const file = fileInputRef.current?.files?.[0]
      if (!file) {
        setError("Please select a file")
        setIsLoading(false)
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        setIsLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in")
        setIsLoading(false)
        return
      }

      // Upload file to Supabase storage
      const fileName = `${user.id}/${documentType}/${Date.now()}`
      const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data } = supabase.storage.from("documents").getPublicUrl(fileName)

      // Save document record
      const { error: dbError } = await supabase.from("documents").insert({
        user_id: user.id,
        document_type: documentType,
        document_url: data.publicUrl,
        verification_status: "pending",
      })

      if (dbError) throw dbError

      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: null,
        action_type: "property_verified",
        target_user_id: user.id,
        target_document_id: null,
        details: `Document uploaded: ${documentType}`,
      })

      router.push("/dashboard/documents")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to upload document")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>Upload a clear image or PDF of your document</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload}>
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={() => setError(null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-2"
                    >
                      Choose File
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {fileInputRef.current?.files?.[0]?.name || "No file selected"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG, or PDF (max 5MB)</p>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? "Uploading..." : "Upload Document"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
