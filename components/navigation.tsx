"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wallet } from "lucide-react"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

export function Navigation() {
  const pathname = usePathname()

  const routes = [
    {
      name: "Issuer Dashboard",
      path: "/issuer",
      active: pathname === "/issuer",
    },
    {
      name: "Student Profile",
      path: "/student",
      active: pathname === "/student",
    },
    {
      name: "Verifier",
      path: "/verifier",
      active: pathname === "/verifier",
    },
  ]

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <span className="text-xl font-bold">VeriGrad</span>
          </Link>
          <nav className="hidden md:flex md:gap-6 ml-10">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  route.active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {route.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  )
}
