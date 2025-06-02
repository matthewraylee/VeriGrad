// components/DiplomaNotice.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function DiplomaNotice() {
  return (
    <Alert className="mt-4">
      <Info className="h-4 w-4" />
      <AlertTitle>About Your Diploma Token</AlertTitle>
      <AlertDescription>
        Your diploma appears as "Unknown Token" in Phantom wallet because it's a
        custom token without display metadata. However, it's still a valid,
        verifiable proof of your credential on the Solana blockchain. You can
        verify it using the token mint address on Solana Explorer.
      </AlertDescription>
    </Alert>
  );
}
