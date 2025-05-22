"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Copy, ExternalLink, Search, Shield, ShieldAlert, User } from "lucide-react"

export default function VerifierPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [verificationResult, setVerificationResult] = useState<"valid" | "invalid" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return

    setIsLoading(true)

    // Simulate verification process
    setTimeout(() => {
      // For demo purposes, let's say any address starting with "0x" is valid
      if (searchQuery.startsWith("0x") || !isNaN(Number(searchQuery))) {
        setVerificationResult("valid")
      } else {
        setVerificationResult("invalid")
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Credential Verifier</h1>
        <p className="text-muted-foreground">Verify the authenticity of academic credentials</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verify Credentials</CardTitle>
            <CardDescription>Enter a wallet address or token ID to verify a diploma</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <Tabs defaultValue="address">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="address">Wallet Address</TabsTrigger>
                  <TabsTrigger value="token">Token ID</TabsTrigger>
                </TabsList>
                <TabsContent value="address" className="pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      placeholder="0x..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Enter the wallet address of the credential holder</p>
                  </div>
                </TabsContent>
                <TabsContent value="token" className="pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="tokenId">Token ID</Label>
                    <Input
                      id="tokenId"
                      placeholder="e.g. 12345"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Enter the unique token ID of the diploma NFT</p>
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="submit" className="w-full" disabled={!searchQuery || isLoading}>
                {isLoading ? (
                  <>Verifying...</>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verify Credential
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Result</CardTitle>
            <CardDescription>The authenticity status of the credential will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {verificationResult === null && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Shield className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Verification Yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Enter a wallet address or token ID and click verify to check credential authenticity
                </p>
              </div>
            )}

            {verificationResult === "valid" && (
              <div className="space-y-6">
                <Alert className="border-green-500 bg-green-50 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    Verified Credential
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Authentic</Badge>
                  </AlertTitle>
                  <AlertDescription>
                    This credential has been verified as authentic and was issued by a trusted institution.
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-4">Credential Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Student Name:</span>
                      <span className="font-medium">Jane Smith</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Degree:</span>
                      <span className="font-medium">BSc in Computer Science</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issue Date:</span>
                      <span className="font-medium">May 15, 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issuer:</span>
                      <span className="font-medium">University of Technology</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issuer Address:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">0x1a2b...3c4d</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                          <span className="sr-only">Copy address</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" size="sm" className="gap-1">
                    <User className="h-4 w-4" />
                    <span>View Student Profile</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-4 w-4" />
                    <span>View on Blockchain</span>
                  </Button>
                </div>
              </div>
            )}

            {verificationResult === "invalid" && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Invalid Credential</AlertTitle>
                <AlertDescription>
                  This credential could not be verified. It may not exist or may have been revoked.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
