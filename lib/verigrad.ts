import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import idl from "@/lib/idl/verigrad.json";

const programId = new PublicKey(process.env.NEXT_PUBLIC_VERIGRAD_PROGRAM_ID!);
const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK!;

export function getVerigradProgram(wallet: Wallet): Program {
  const connection = new Connection(network, "processed");
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });

  return new Program(idl as Idl, programId, provider);
}
