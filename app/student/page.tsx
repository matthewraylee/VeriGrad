"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText, Wallet } from "lucide-react"
import { useState } from "react"

export default function StudentProfile() {
  const [isConnected, setIsConnected] = useState(false)

  // Sample diploma data
  const diplomas = [
    {
      id: "1",
      degreeType: "BSc",
      degreeProgram: "Computer Science",
      institution: "University of Technology",
      issueDate: "May 15, 2023",
      tokenId: "12345",
      ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    },
    {
      id: "2",
      degreeType: "MSc",
      degreeProgram: "Data Science",
      institution: "Digital University",
      issueDate: "December 10, 2022",
      tokenId: "67890",
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    },
  ]

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Student Profile</h1>
        <p className="text-muted-foreground">View your blockchain-verified academic credentials</p>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Connect your wallet to view your blockchain-verified academic credentials
          </p>
          <Button onClick={() => setIsConnected(true)} className="gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Connected Wallet</p>
                <p className="text-sm text-muted-foreground">0x742d35Cc6634C0532925a3b844Bc454e4438f44e</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsConnected(false)}>
              Disconnect
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {diplomas.map((diploma) => (
              <Card key={diploma.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge className="mb-2">{diploma.degreeType}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </div>
                  <CardTitle className="text-xl">{diploma.degreeProgram}</CardTitle>
                  <CardDescription>{diploma.institution}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issue Date:</span>
                      <span>{diploma.issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token ID:</span>
                      <span className="font-mono">{diploma.tokenId}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-3">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View on IPFS</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Explorer</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
