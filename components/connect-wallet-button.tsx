"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function ConnectWalletButton() {
  const { connected, publicKey, disconnect } = useWallet();

  if (connected && publicKey) {
    return (
      <Button
        variant="outline"
        onClick={disconnect}
        className="flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </span>
        <span className="sm:hidden">Connected</span>
      </Button>
    );
  }

  return (
    <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-md !px-4 !py-2 !text-sm !font-medium !h-10 !flex !items-center !gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </WalletMultiButton>
  );
}
