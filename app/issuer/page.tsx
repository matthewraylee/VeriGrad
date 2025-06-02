"use client";

import type React from "react";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Check,
  Clock,
  FileUp,
  GraduationCap,
  X,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  createSplitTransactionNFT,
  DiplomaMetadata,
} from "@/lib/split-transaction-nft";
import { DiplomaNotice } from "@/components/DiplomaNotice";

export default function IssuerDashboard() {
  const { publicKey, signTransaction } = useWallet();
  const [date, setDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    studentName: "",
    walletAddress: "",
    degreeProgram: "",
    degreeType: "",
    graduationYear: new Date().getFullYear().toString(),
    gpa: "",
    honors: "",
  });

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
      type: "NFT",
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
      type: "Program Account",
    },
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitNFT = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey || !signTransaction) {
      setStatus("❌ Wallet not connected.");
      return;
    }

    if (
      !formData.studentName ||
      !formData.degreeProgram ||
      !formData.degreeType
    ) {
      setStatus("❌ Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setStatus("🔄 Creating diploma NFT...");

    try {
      const wallet = { publicKey, signTransaction };

      // Use provided wallet address or default to issuer's wallet
      const recipientAddress = formData.walletAddress || publicKey.toBase58();
      const recipient = new PublicKey(recipientAddress);

      const diplomaData: DiplomaMetadata = {
        studentName: formData.studentName,
        degree: `${formData.degreeType} in ${formData.degreeProgram}`,
        graduationYear: parseInt(formData.graduationYear),
        institution: "Your University Name",
        gpa: formData.gpa || undefined,
        honors: formData.honors || undefined,
      };

      const result = await createSplitTransactionNFT(
        wallet,
        recipient,
        diplomaData,
        (step) => setStatus(`🔄 ${step}`)
      );

      setStatus(`✅ Diploma NFT created successfully!
      
🏆 Mint Address: ${result.mint}
📝 Transactions: ${result.transactions.join(", ")}
🎯 Token Account: ${result.associatedTokenAccount}

⚠️ Note: This will show as "Unknown Token" in Phantom because it doesn't have Metaplex metadata.
To see it as a proper NFT with image and details, we need to add metadata in a separate transaction.

The token represents your diploma and proves ownership on the blockchain!`);

      // Add to issued diplomas list
      const newDiploma = {
        id: (issuedDiplomas.length + 1).toString(),
        studentName: formData.studentName,
        degreeProgram: formData.degreeProgram,
        degreeType: formData.degreeType,
        graduationDate: date
          ? format(date, "yyyy-MM-dd")
          : formData.graduationYear,
        walletAddress: recipientAddress,
        status: "success",
        txHash: result.signature,
        type: "NFT",
      };
      setIssuedDiplomas([newDiploma, ...issuedDiplomas]);

      // Reset form
      setFormData({
        studentName: "",
        walletAddress: "",
        degreeProgram: "",
        degreeType: "",
        graduationYear: new Date().getFullYear().toString(),
        gpa: "",
        honors: "",
      });
      setDate(undefined);
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Failed to create diploma NFT: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Issuer Dashboard</h1>
        <p className="text-muted-foreground">
          Issue and manage blockchain diplomas as NFTs
        </p>
      </div>

      <Tabs defaultValue="issue">
        <TabsList className="mb-6">
          <TabsTrigger value="issue">Issue Diploma NFT</TabsTrigger>
          <TabsTrigger value="manage">Manage Diplomas</TabsTrigger>
        </TabsList>

        <TabsContent value="issue">
          <Card>
            <CardHeader>
              <CardTitle>Issue New Diploma NFT</CardTitle>
              <CardDescription>
                Fill in the details to mint a new diploma NFT that will appear
                in the student's wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status && (
                <div
                  className={`mb-4 p-4 rounded-lg border ${
                    status.includes("✅")
                      ? "bg-green-50 border-green-200"
                      : status.includes("❌")
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <pre className="whitespace-pre-wrap text-sm">{status}</pre>
                </div>
              )}

              <form onSubmit={handleSubmitNFT} className="space-y-6">
                <DiplomaNotice />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name *</Label>
                    <Input
                      id="studentName"
                      placeholder="Full name"
                      value={formData.studentName}
                      onChange={(e) =>
                        handleInputChange("studentName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">
                      Student Wallet Address
                    </Label>
                    <Input
                      id="walletAddress"
                      placeholder="0x... (optional - defaults to your wallet)"
                      value={formData.walletAddress}
                      onChange={(e) =>
                        handleInputChange("walletAddress", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="degreeProgram">Degree Program *</Label>
                    <Input
                      id="degreeProgram"
                      placeholder="e.g. Computer Science"
                      value={formData.degreeProgram}
                      onChange={(e) =>
                        handleInputChange("degreeProgram", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degreeType">Degree Type *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("degreeType", value)
                      }
                    >
                      <SelectTrigger id="degreeType">
                        <SelectValue placeholder="Select degree type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BSc">BSc</SelectItem>
                        <SelectItem value="MSc">MSc</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="BA">BA</SelectItem>
                        <SelectItem value="MA">MA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year *</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      placeholder="2024"
                      value={formData.graduationYear}
                      onChange={(e) =>
                        handleInputChange("graduationYear", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA (Optional)</Label>
                    <Input
                      id="gpa"
                      placeholder="3.85"
                      value={formData.gpa}
                      onChange={(e) => handleInputChange("gpa", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="honors">Honors (Optional)</Label>
                    <Input
                      id="honors"
                      placeholder="Magna Cum Laude"
                      value={formData.honors}
                      onChange={(e) =>
                        handleInputChange("honors", e.target.value)
                      }
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={isLoading || !publicKey}
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  {isLoading ? "Creating NFT..." : "Mint Diploma NFT"}
                </Button>
              </form>
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
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
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
                      <div className="col-span-2">
                        <Badge
                          variant={
                            diploma.type === "NFT" ? "default" : "secondary"
                          }
                        >
                          {diploma.type}
                        </Badge>
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
                      <div className="col-span-2 text-right">
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
