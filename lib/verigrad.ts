import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";

const PROGRAM_ID = "BstGvvP7WHFodit1KdrzkyEoqQRyT5LfRzKxL6wmw6N6";
const NETWORK = "https://api.devnet.solana.com";

// Define the IDL inline to avoid import issues
const IDL: Idl = {
  version: "0.1.0",
  name: "verigrad",
  instructions: [
    {
      name: "issueDiploma",
      accounts: [
        { name: "diploma", isMut: true, isSigner: true },
        { name: "issuer", isMut: true, isSigner: true },
        { name: "student", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "studentName", type: "string" },
        { name: "degree", type: "string" },
        { name: "graduationYear", type: "u16" },
      ],
    },
  ],
  accounts: [
    {
      name: "Diploma",
      type: {
        kind: "struct",
        fields: [
          { name: "issuer", type: "publicKey" },
          { name: "student", type: "publicKey" },
          { name: "studentName", type: "string" },
          { name: "degree", type: "string" },
          { name: "graduationYear", type: "u16" },
          { name: "issuedAt", type: "i64" },
        ],
      },
    },
  ],
};

export function getVerigradProgram(wallet: WalletContextState): Program | null {
  try {
    console.log("Getting program with wallet:", wallet.publicKey?.toString());

    if (!wallet.publicKey || !wallet.signTransaction) {
      console.error("Wallet not properly connected");
      return null;
    }

    const connection = new Connection(NETWORK, "processed");
    console.log("Connection created for:", NETWORK);

    // Create a wallet adapter for Anchor
    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions || wallet.signTransaction,
    };

    const provider = new AnchorProvider(connection, anchorWallet as any, {
      preflightCommitment: "processed",
    });

    console.log("Provider created");

    // Create program ID
    const programId = new PublicKey(PROGRAM_ID);
    console.log("Program ID:", programId.toString());

    // Create program with inline IDL
    const program = new Program(IDL, programId, provider);
    console.log("Program created successfully");

    return program;
  } catch (error) {
    console.error("Error creating program:", error);
    return null;
  }
}
