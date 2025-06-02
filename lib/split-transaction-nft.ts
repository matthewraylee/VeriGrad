// lib/split-transaction-nft.ts
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

export interface DiplomaMetadata {
  studentName: string;
  degree: string;
  graduationYear: number;
  institution: string;
  gpa?: string;
  honors?: string;
}

export async function createSplitTransactionNFT(
  wallet: any,
  recipient: PublicKey,
  diplomaData: DiplomaMetadata,
  onProgress?: (step: string) => void
) {
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  // Get associated token account for recipient
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mint,
    recipient
  );

  try {
    // TRANSACTION 1: Create and initialize mint
    onProgress?.("Creating mint account...");

    const transaction1 = new Transaction();
    const rentExemptAmount = await getMinimumBalanceForRentExemptMint(
      connection
    );

    // Create mint account
    transaction1.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint,
        lamports: rentExemptAmount,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // Initialize mint
    transaction1.add(
      createInitializeMintInstruction(
        mint,
        0, // 0 decimals for NFT
        wallet.publicKey, // mint authority
        null // freeze authority
      )
    );

    // Send transaction 1
    const {
      blockhash: blockhash1,
      lastValidBlockHeight: lastValidBlockHeight1,
    } = await connection.getLatestBlockhash();
    transaction1.recentBlockhash = blockhash1;
    transaction1.feePayer = wallet.publicKey;
    transaction1.partialSign(mintKeypair);

    const signedTransaction1 = await wallet.signTransaction(transaction1);
    const signature1 = await connection.sendRawTransaction(
      signedTransaction1.serialize()
    );
    await connection.confirmTransaction({
      signature: signature1,
      blockhash: blockhash1,
      lastValidBlockHeight: lastValidBlockHeight1,
    });

    // TRANSACTION 2: Create token account and mint NFT
    onProgress?.("Creating token account and minting NFT...");

    const transaction2 = new Transaction();

    // Create associated token account
    transaction2.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey, // payer
        associatedTokenAccount,
        recipient, // owner
        mint
      )
    );

    // Mint 1 NFT to recipient
    transaction2.add(
      createMintToInstruction(
        mint,
        associatedTokenAccount,
        wallet.publicKey,
        1 // mint 1 NFT
      )
    );

    // Send transaction 2
    const {
      blockhash: blockhash2,
      lastValidBlockHeight: lastValidBlockHeight2,
    } = await connection.getLatestBlockhash();
    transaction2.recentBlockhash = blockhash2;
    transaction2.feePayer = wallet.publicKey;

    const signedTransaction2 = await wallet.signTransaction(transaction2);
    const signature2 = await connection.sendRawTransaction(
      signedTransaction2.serialize()
    );
    await connection.confirmTransaction({
      signature: signature2,
      blockhash: blockhash2,
      lastValidBlockHeight: lastValidBlockHeight2,
    });

    onProgress?.("NFT created successfully!");

    return {
      mint: mint.toBase58(),
      signature: signature2, // Return the minting signature
      associatedTokenAccount: associatedTokenAccount.toBase58(),
      diplomaData,
      transactions: [signature1, signature2],
    };
  } catch (error) {
    console.error("Error creating NFT:", error);
    throw error;
  }
}
