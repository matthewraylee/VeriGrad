// lib/simple-diploma-token.ts
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_NETWORK || "https://api.devnet.solana.com"
);

export interface DiplomaData {
  studentName: string;
  degree: string;
  graduationYear: number;
  institution: string;
}

export async function createSimpleDiplomaToken(
  wallet: any,
  recipient: PublicKey,
  diplomaData: DiplomaData
) {
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  // Get associated token account for recipient
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mint,
    recipient
  );

  const transaction = new Transaction();

  // Get rent for mint account
  const rentExemptAmount = await getMinimumBalanceForRentExemptMint(connection);

  // Create mint account
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mint,
      lamports: rentExemptAmount,
      space: MINT_SIZE,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  // Initialize mint (1 decimal place, so we can mint 1 token representing the diploma)
  transaction.add(
    createInitializeMintInstruction(
      mint,
      0, // 0 decimals = whole tokens only
      wallet.publicKey, // mint authority
      null // freeze authority (null = no freeze)
    )
  );

  // Create associated token account for recipient
  transaction.add(
    createAssociatedTokenAccountInstruction(
      wallet.publicKey, // payer
      associatedTokenAccount,
      recipient, // owner
      mint
    )
  );

  // Mint 1 token to recipient (representing the diploma)
  transaction.add(
    createMintToInstruction(
      mint,
      associatedTokenAccount,
      wallet.publicKey,
      1 // mint 1 diploma token
    )
  );

  // Set recent blockhash and fee payer
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  // Sign with mint keypair first
  transaction.partialSign(mintKeypair);

  // Sign with wallet
  const signedTransaction = await wallet.signTransaction(transaction);

  // Send transaction
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize()
  );

  // Wait for confirmation
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight: (
      await connection.getLatestBlockhash()
    ).lastValidBlockHeight,
  });

  return {
    mint: mint.toBase58(),
    signature,
    associatedTokenAccount: associatedTokenAccount.toBase58(),
    diplomaData, // Include the diploma data for display
  };
}
