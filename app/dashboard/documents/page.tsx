"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

const REQUIRED_DOCUMENTS = [
  { type: "national_id", label: "National ID", description: "Valid government-issued ID" },
  { type: "title_deed", label: "Title Deed", description: "Property title documentation" },
  { type: "proof_of_ownership", label: "Proof of Ownership", description: "Official ownership document" },
]

const OPTIONAL_DOCUMENTS = [
  { type: "utility_bill", label: "Utility Bill", description: "Recent utility bill as proof of residence" },
  {
    type: "certificate_of_occupancy",
    label: "Certificate of Occupancy",
    description: "Official occupancy certificate",
  },
  { type: "survey_plan", label: "Survey Plan", description: "Property survey document" },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data } = await supabase.from("documents").select("*").eq("user_id", user.id)

        setDocuments(data || [])
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [supabase, router])

  const getDocumentStatus = (type: string) => {
    const doc = documents.find((d) => d.document_type === type)
    if (!doc) return "missing"
    return doc.verification_status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600"
      case "rejected":
        return "text-red-600"
      case "pending":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account Verification</h1>
            <p className="text-muted-foreground">
              Upload required documents to verify your account and build trust with other users
            </p>
          </div>

          {/* Required Documents */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>You must upload these documents for account verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {REQUIRED_DOCUMENTS.map((doc) => (
                  <div key={doc.type} className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${getStatusColor(getDocumentStatus(doc.type))}`}>
                        {getDocumentStatus(doc.type) === "missing"
                          ? "Not Uploaded"
                          : getDocumentStatus(doc.type).charAt(0).toUpperCase() + getDocumentStatus(doc.type).slice(1)}
                      </span>
                      <Link href={`/dashboard/documents/upload?type=${doc.type}`}>
                        <Button size="sm">{getDocumentStatus(doc.type) === "missing" ? "Upload" : "Replace"}</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optional Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Optional Documents</CardTitle>
              <CardDescription>Upload additional documents to increase your credibility (recommended)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {OPTIONAL_DOCUMENTS.map((doc) => (
                  <div key={doc.type} className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-medium text-sm ${getStatusColor(getDocumentStatus(doc.type))}`}>
                        {getDocumentStatus(doc.type) === "missing"
                          ? "Not Uploaded"
                          : getDocumentStatus(doc.type).charAt(0).toUpperCase() + getDocumentStatus(doc.type).slice(1)}
                      </span>
                      <Link href={`/dashboard/documents/upload?type=${doc.type}`}>
                        <Button size="sm" variant="outline">
                          {getDocumentStatus(doc.type) === "missing" ? "Upload" : "Replace"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
