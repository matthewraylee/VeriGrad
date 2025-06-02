"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { getVerigradProgram } from "@/lib/verigrad";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DiplomaForm {
  studentName: string;
  walletAddress: string;
  degreeProgram: string;
  degreeType: string;
  graduationYear: number;
}

export default function IssueDiplomaForm() {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [form, setForm] = useState<DiplomaForm>({
    studentName: "",
    walletAddress: "",
    degreeProgram: "",
    degreeType: "",
    graduationYear: new Date().getFullYear(),
  });

  const handleInputChange = (
    field: keyof DiplomaForm,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.connected || !wallet.publicKey) {
      setStatus({
        type: "error",
        message: "Please connect your wallet first.",
      });
      return;
    }

    if (!form.studentName || !form.degreeProgram || !form.degreeType) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "info", message: "Preparing transaction..." });

    try {
      console.log("Getting program...");
      const program = getVerigradProgram(wallet);

      if (!program) {
        throw new Error("Failed to initialize program");
      }

      console.log("Creating diploma keypair...");
      const diplomaKeypair = Keypair.generate();

      console.log("Form data:", form);
      console.log("Diploma address:", diplomaKeypair.publicKey.toBase58());
      console.log("Issuer (wallet):", wallet.publicKey.toBase58());

      setStatus({ type: "info", message: "Sending transaction..." });

      // Call the smart contract
      const tx = await program.methods
        .issueDiploma(
          form.studentName,
          `${form.degreeType} in ${form.degreeProgram}`,
          form.graduationYear
        )
        .accounts({
          diploma: diplomaKeypair.publicKey,
          issuer: wallet.publicKey,
          student: wallet.publicKey, // For now, issuing to self for testing
          systemProgram: SystemProgram.programId,
        })
        .signers([diplomaKeypair])
        .rpc();

      console.log("Transaction successful:", tx);

      setStatus({
        type: "success",
        message: `✅ Diploma issued successfully! Transaction: ${tx.slice(
          0,
          8
        )}...`,
      });

      // Reset form
      setForm({
        studentName: "",
        walletAddress: "",
        degreeProgram: "",
        degreeType: "",
        graduationYear: new Date().getFullYear(),
      });
    } catch (error: any) {
      console.error("Error issuing diploma:", error);

      let errorMessage = "Failed to issue diploma. ";
      if (error.message?.includes("User rejected")) {
        errorMessage += "Transaction was rejected.";
      } else if (error.message?.includes("Insufficient funds")) {
        errorMessage += "Insufficient SOL for transaction fees.";
      } else if (error.message?.includes("Blockhash not found")) {
        errorMessage += "Network error. Please try again.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }

      setStatus({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status && (
        <Alert
          className={
            status.type === "error"
              ? "border-red-500 bg-red-50"
              : status.type === "success"
              ? "border-green-500 bg-green-50"
              : "border-blue-500 bg-blue-50"
          }
        >
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="studentName">Student Name *</Label>
          <Input
            id="studentName"
            placeholder="Full name"
            value={form.studentName}
            onChange={(e) => handleInputChange("studentName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="walletAddress">Student Wallet Address</Label>
          <Input
            id="walletAddress"
            placeholder="0x... (optional for testing)"
            value={form.walletAddress}
            onChange={(e) => handleInputChange("walletAddress", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="degreeProgram">Degree Program *</Label>
          <Input
            id="degreeProgram"
            placeholder="e.g. Computer Science"
            value={form.degreeProgram}
            onChange={(e) => handleInputChange("degreeProgram", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="degreeType">Degree Type *</Label>
          <Select
            value={form.degreeType}
            onValueChange={(value) => handleInputChange("degreeType", value)}
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="graduationYear">Graduation Year *</Label>
          <Input
            id="graduationYear"
            type="number"
            min="1900"
            max="2030"
            value={form.graduationYear}
            onChange={(e) =>
              handleInputChange(
                "graduationYear",
                parseInt(e.target.value) || new Date().getFullYear()
              )
            }
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full md:w-auto"
        disabled={isLoading || !wallet.connected}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Issuing Diploma...
          </>
        ) : (
          <>
            <GraduationCap className="mr-2 h-4 w-4" />
            Issue Diploma
          </>
        )}
      </Button>

      {!wallet.connected && (
        <p className="text-sm text-muted-foreground">
          Please connect your wallet to issue diplomas.
        </p>
      )}
    </form>
  );
}
