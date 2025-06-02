// lib/working-nft-diploma.ts
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

// Metaplex Token Metadata Program ID
const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export interface DiplomaMetadata {
  studentName: string;
  degree: string;
  graduationYear: number;
  institution: string;
  gpa?: string;
  honors?: string;
}

// Function to create metadata instruction manually
function createMetadataInstruction(
  metadataAccount: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  updateAuthority: PublicKey,
  name: string,
  symbol: string,
  uri: string
) {
  const keys = [
    { pubkey: metadataAccount, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: updateAuthority, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  // Simplified instruction data for CreateMetadataAccountV3
  const nameBytes = Buffer.from(name, "utf8");
  const symbolBytes = Buffer.from(symbol, "utf8");
  const uriBytes = Buffer.from(uri, "utf8");

  const data = Buffer.concat([
    Buffer.from([33]), // CreateMetadataAccountV3 discriminator
    Buffer.from([nameBytes.length, 0, 0, 0]), // name length (u32)
    nameBytes,
    Buffer.from([symbolBytes.length, 0, 0, 0]), // symbol length (u32)
    symbolBytes,
    Buffer.from([uriBytes.length, 0, 0, 0]), // uri length (u32)
    uriBytes,
    Buffer.from([0, 0]), // seller_fee_basis_points (u16)
    Buffer.from([1]), // creators present
    Buffer.from([1]), // creators length
    mintAuthority.toBuffer(),
    Buffer.from([1]), // verified
    Buffer.from([100]), // share
    Buffer.from([0]), // collection not present
    Buffer.from([0]), // uses not present
    Buffer.from([0]), // collection details not present
  ]);

  return {
    keys,
    programId: METADATA_PROGRAM_ID,
    data,
  };
}

export async function createWorkingNFT(
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

  // Find metadata account PDA
  const [metadataAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );

  // Create metadata JSON
  const metadata = {
    name: `${diplomaData.degree} - ${diplomaData.studentName}`,
    symbol: "DIPLOMA",
    description: `Official ${diplomaData.degree} diploma issued to ${diplomaData.studentName} in ${diplomaData.graduationYear} by ${diplomaData.institution}`,
    image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      diplomaData.studentName
    )}&backgroundColor=0d8abc`,
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
  };

  // For now, we'll use a data URI (in production, upload to IPFS)
  const metadataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(metadata)
  )}`;

  const transaction = new Transaction();

  // Get rent for mint account
  const rentExemptAmount = await getMinimumBalanceForRentExemptMint(connection);

  // 1. Create mint account
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mint,
      lamports: rentExemptAmount,
      space: MINT_SIZE,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  // 2. Initialize mint
  transaction.add(
    createInitializeMintInstruction(
      mint,
      0, // 0 decimals for NFT
      wallet.publicKey, // mint authority
      null // freeze authority
    )
  );

  // 3. Create associated token account
  transaction.add(
    createAssociatedTokenAccountInstruction(
      wallet.publicKey, // payer
      associatedTokenAccount,
      recipient, // owner
      mint
    )
  );

  // 4. Mint 1 NFT to recipient
  transaction.add(
    createMintToInstruction(
      mint,
      associatedTokenAccount,
      wallet.publicKey,
      1 // mint 1 NFT
    )
  );

  // 5. Create metadata account
  const metadataInstruction = createMetadataInstruction(
    metadataAccount,
    mint,
    wallet.publicKey,
    wallet.publicKey,
    wallet.publicKey,
    metadata.name,
    metadata.symbol,
    metadataUri
  );

  transaction.add(metadataInstruction);

  // Set recent blockhash and fee payer
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
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
    lastValidBlockHeight,
  });

  return {
    mint: mint.toBase58(),
    signature,
    associatedTokenAccount: associatedTokenAccount.toBase58(),
    metadata: metadataAccount.toBase58(),
    diplomaData,
  };
}
