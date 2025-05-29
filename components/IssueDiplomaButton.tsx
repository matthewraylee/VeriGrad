"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { getVerigradProgram } from "@/lib/verigrad";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { useState } from "react";

export default function IssueDiplomaButton() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [status, setStatus] = useState<string | null>(null);

  const handleIssue = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      setStatus("Wallet not connected.");
      return;
    }

    setStatus("Preparing transaction...");

    try {
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };

      const program = getVerigradProgram(wallet as any);
      const diplomaKeypair = Keypair.generate();

      await program.methods
        .issueDiploma("John Doe", "Bachelor of Science", 2024)
        .accounts({
          diploma: diplomaKeypair.publicKey,
          issuer: publicKey,
          student: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([diplomaKeypair])
        .rpc();

      setStatus(`✅ Diploma issued: ${diplomaKeypair.publicKey.toBase58()}`);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Failed to issue diploma.");
    }
  };

  return (
    <div>
      <button
        onClick={handleIssue}
        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
      >
        Issue Diploma
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
}
