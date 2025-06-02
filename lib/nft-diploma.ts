// lib/nft-diploma.ts
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
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

// Define the Token Metadata Program ID manually
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

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

export async function createDiplomaNFT(
  wallet: any,
  recipient: PublicKey,
  diplomaData: DiplomaMetadata
) {
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  // Get associated token account for recipient
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mint,
    recipient
  );

  // Create metadata account address
  const [metadataAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  // Prepare NFT metadata
  const metadata = {
    name: `${diplomaData.degree} - ${diplomaData.studentName}`,
    symbol: "DIPLOMA",
    description: `Official ${diplomaData.degree} diploma issued to ${diplomaData.studentName} in ${diplomaData.graduationYear} by ${diplomaData.institution}`,
    image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      diplomaData.studentName
    )}&backgroundColor=0d8abc,f9c23c,fd6c5c`,
    attributes: [
      { trait_type: "Student", value: diplomaData.studentName },
      { trait_type: "Degree", value: diplomaData.degree },
      { trait_type: "Year", value: diplomaData.graduationYear.toString() },
      { trait_type: "Institution", value: diplomaData.institution },
      ...(diplomaData.gpa
        ? [{ trait_type: "GPA", value: diplomaData.gpa }]
        : []),
      ...(diplomaData.honors
        ? [{ trait_type: "Honors", value: diplomaData.honors }]
        : []),
    ],
    properties: {
      category: "image",
      files: [
        {
          uri: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            diplomaData.studentName
          )}&backgroundColor=0d8abc,f9c23c,fd6c5c`,
          type: "image/svg+xml",
        },
      ],
    },
  };

  // Create a simple metadata URI (in production, you'd use IPFS)
  const metadataUri = `data:application/json;base64,${Buffer.from(
    JSON.stringify(metadata)
  ).toString("base64")}`;

  // Create metadata instruction data manually
  const metadataData = {
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadataUri,
    sellerFeeBasisPoints: 0,
    creators: [
      {
        address: wallet.publicKey,
        verified: true,
        share: 100,
      },
    ],
    collection: null,
    uses: null,
  };

  // Serialize the instruction data (simplified version)
  const instructionData = Buffer.concat([
    Buffer.from([33]), // CreateMetadataAccountV3 instruction discriminator
    // This is a simplified version - in production you'd want proper borsh serialization
  ]);

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

  // Initialize mint
  transaction.add(
    createInitializeMintInstruction(
      mint,
      0, // decimals
      wallet.publicKey, // mint authority
      null // freeze authority
    )
  );

  // Create associated token account
  transaction.add(
    createAssociatedTokenAccountInstruction(
      wallet.publicKey, // payer
      associatedTokenAccount,
      recipient, // owner
      mint
    )
  );

  // Mint token to recipient
  transaction.add(
    createMintToInstruction(
      mint,
      associatedTokenAccount,
      wallet.publicKey,
      1 // amount (1 NFT)
    )
  );

  // Set recent blockhash and fee payer
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  // Sign with mint keypair
  transaction.partialSign(mintKeypair);

  // Sign with wallet
  const signedTransaction = await wallet.signTransaction(transaction);

  // Send transaction
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize()
  );
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
    metadata: metadataAccount.toBase58(),
  };
}
