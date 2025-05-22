"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export function ConnectWalletButton() {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState("")

  const handleConnect = () => {
    // Simulate wallet connection
    setConnected(true)
    setAddress("0x1234...5678")
  }

  const handleDisconnect = () => {
    setConnected(false)
    setAddress("")
  }

  if (connected) {
    return (
      <Button variant="outline" onClick={handleDisconnect} className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">{address}</span>
        <span className="sm:hidden">Connected</span>
      </Button>
    )
  }

  return (
    <Button onClick={handleConnect} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </Button>
  )
}
