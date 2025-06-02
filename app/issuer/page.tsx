"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, X } from "lucide-react";
import IssueDiplomaForm from "@/components/IssueDiplomaForm";

export default function IssuerDashboard() {
  const [issuedDiplomas, setIssuedDiplomas] = useState([
    {
      id: "1",
      studentName: "Jane Smith",
      degreeProgram: "Computer Science",
      degreeType: "BSc",
      graduationDate: "2023-05-15",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      status: "success",
      txHash: "0x123...456",
    },
    {
      id: "2",
      studentName: "John Doe",
      degreeProgram: "Data Science",
      degreeType: "MSc",
      graduationDate: "2023-05-15",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      status: "pending",
      txHash: "",
    },
    {
      id: "3",
      studentName: "Alex Johnson",
      degreeProgram: "Blockchain Technology",
      degreeType: "PhD",
      graduationDate: "2023-05-15",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      status: "failed",
      txHash: "",
    },
  ]);

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Issuer Dashboard</h1>
        <p className="text-muted-foreground">
          Issue and manage blockchain diplomas
        </p>
      </div>

      <Tabs defaultValue="issue">
        <TabsList className="mb-6">
          <TabsTrigger value="issue">Issue Diploma</TabsTrigger>
          <TabsTrigger value="manage">Manage Diplomas</TabsTrigger>
        </TabsList>

        <TabsContent value="issue">
          <Card>
            <CardHeader>
              <CardTitle>Issue New Diploma</CardTitle>
              <CardDescription>
                Fill in the details to mint a new diploma NFT for a student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IssueDiplomaForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Issued Diplomas</CardTitle>
              <CardDescription>
                View and manage all diplomas issued through VeriGrad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b bg-muted/50 p-4 text-sm font-medium">
                  <div className="col-span-3">Student</div>
                  <div className="col-span-3">Degree</div>
                  <div className="col-span-3">Wallet Address</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {issuedDiplomas.map((diploma) => (
                    <div
                      key={diploma.id}
                      className="grid grid-cols-12 items-center p-4"
                    >
                      <div className="col-span-3 font-medium">
                        {diploma.studentName}
                      </div>
                      <div className="col-span-3">
                        {diploma.degreeType} in {diploma.degreeProgram}
                      </div>
                      <div className="col-span-3 text-sm text-muted-foreground truncate">
                        {diploma.walletAddress}
                      </div>
                      <div className="col-span-2">
                        {diploma.status === "success" && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <Check className="mr-1 h-3 w-3" /> Success
                          </Badge>
                        )}
                        {diploma.status === "pending" && (
                          <Badge
                            variant="outline"
                            className="border-amber-500 text-amber-500"
                          >
                            <Clock className="mr-1 h-3 w-3" /> Pending
                          </Badge>
                        )}
                        {diploma.status === "failed" && (
                          <Badge variant="destructive">
                            <X className="mr-1 h-3 w-3" /> Failed
                          </Badge>
                        )}
                      </div>
                      <div className="col-span-1 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">View details</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
