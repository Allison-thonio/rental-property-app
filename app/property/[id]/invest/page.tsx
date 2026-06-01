"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"

export default function InvestPage() {
  const params = useParams()
  const propertyId = params.id as string
  const [property, setProperty] = useState<any>(null)
  const [investmentType, setInvestmentType] = useState("fixed_return")
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [expectedReturn, setExpectedReturn] = useState("")
  const [investmentTerm, setInvestmentTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await supabase
          .from("properties")
          .select("*,seller:seller_id(first_name,last_name,email)")
          .eq("id", propertyId)
          .single()

        setProperty(data)
      } catch (error) {
        console.error("Error fetching property:", error)
      }
    }

    fetchProperty()
  }, [propertyId, supabase])

  const handleSubmitInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      if (!investmentAmount || !investmentTerm) {
        setError("Please fill in all required fields")
        setIsLoading(false)
        return
      }

      // Create investment proposal
      const { data: investment, error: investError } = await supabase
        .from("investments")
        .insert({
          property_id: propertyId,
          investor_id: user.id,
          seller_id: property.seller_id.id,
          investment_amount: Number.parseFloat(investmentAmount),
          investment_type: investmentType,
          expected_return: investmentType === "fixed_return" ? Number.parseFloat(expectedReturn) : null,
          investment_term_months: Number.parseInt(investmentTerm),
          status: "proposed",
        })
        .select()
        .single()

      if (investError) throw investError

      // Create initial message
      await supabase.from("investor_conversations").insert({
        property_id: propertyId,
        investment_id: investment.id,
        sender_id: user.id,
        message_text: `I'm interested in investing ${investmentAmount} in this property.`,
      })

      router.push("/dashboard/investments")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit investment proposal")
    } finally {
      setIsLoading(false)
    }
  }

  if (!property) return <div>Loading...</div>

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Invest in Property</CardTitle>
              <CardDescription>{property.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitInvestment}>
                <div className="space-y-4">
                  <div>
                    <Label>Investment Type</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        type="button"
                        variant={investmentType === "fixed_return" ? "default" : "outline"}
                        onClick={() => setInvestmentType("fixed_return")}
                      >
                        Fixed Return
                      </Button>
                      <Button
                        type="button"
                        variant={investmentType === "equity" ? "default" : "outline"}
                        onClick={() => setInvestmentType("equity")}
                      >
                        Equity
                      </Button>
                      <Button
                        type="button"
                        variant={investmentType === "negotiated" ? "default" : "outline"}
                        onClick={() => setInvestmentType("negotiated")}
                      >
                        Negotiated
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amount">Investment Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="1,000,000"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      required
                    />
                  </div>

                  {investmentType === "fixed_return" && (
                    <div>
                      <Label htmlFor="return">Expected Annual Return (%)</Label>
                      <Input
                        id="return"
                        type="number"
                        step="0.1"
                        placeholder="15"
                        value={expectedReturn}
                        onChange={(e) => setExpectedReturn(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="term">Investment Term (Months)</Label>
                    <Input
                      id="term"
                      type="number"
                      placeholder="12"
                      value={investmentTerm}
                      onChange={(e) => setInvestmentTerm(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? "Submitting..." : "Submit Investment Proposal"}
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
