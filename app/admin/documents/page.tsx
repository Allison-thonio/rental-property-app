"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
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

        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

        if (!profile?.is_admin) {
          router.push("/")
          return
        }

        setIsAdmin(true)

        const { data } = await supabase
          .from("documents")
          .select("*,user:user_id(first_name,last_name,email)")
          .eq("verification_status", "pending")
          .order("created_at", { ascending: false })

        setDocuments(data || [])
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [supabase, router])

  const handleApproveDocument = async (documentId: string, userId: string) => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from("documents")
        .update({
          verification_status: "approved",
          verified_by: currentUser?.id,
        })
        .eq("id", documentId)

      if (error) throw error

      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: currentUser?.id,
        action_type: "document_approved",
        target_user_id: userId,
        target_document_id: documentId,
        details: "Document approved",
      })

      setDocuments(documents.filter((d) => d.id !== documentId))
    } catch (error) {
      console.error("Error approving document:", error)
    }
  }

  const handleRejectDocument = async (documentId: string, userId: string, reason: string) => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from("documents")
        .update({
          verification_status: "rejected",
          verified_by: currentUser?.id,
          admin_notes: reason,
        })
        .eq("id", documentId)

      if (error) throw error

      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: currentUser?.id,
        action_type: "document_rejected",
        target_user_id: userId,
        target_document_id: documentId,
        details: `Document rejected: ${reason}`,
      })

      setDocuments(documents.filter((d) => d.id !== documentId))
    } catch (error) {
      console.error("Error rejecting document:", error)
    }
  }

  if (!isAdmin || isLoading) return <div>Loading...</div>

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Document Verification</h1>
              <p className="text-muted-foreground">Review and approve user documents for account verification</p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          {documents.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No pending documents to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {documents.map((doc: any) => (
                <Card key={doc.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {doc.user.first_name} {doc.user.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{doc.user.email}</p>
                        <div className="mt-3 bg-muted p-3 rounded">
                          <p className="text-sm">
                            <span className="font-medium">Document Type:</span>{" "}
                            {doc.document_type.replace(/_/g, " ").toUpperCase()}
                          </p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">Status:</span> {doc.verification_status}
                          </p>
                          {doc.document_url && (
                            <p className="text-sm mt-1">
                              <a
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                View Document
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveDocument(doc.id, doc.user_id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleRejectDocument(doc.id, doc.user_id, "Document quality or authenticity issue")
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
