import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Shield, User } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blockchain-Verified Academic Credentials</h1>
        <p className="text-xl text-muted-foreground">
          VeriGrad helps institutions issue, students manage, and employers verify academic credentials on the
          blockchain.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link href="/issuer">
            <Button size="lg" className="gap-2">
              <GraduationCap className="h-5 w-5" />
              Issue Diplomas
            </Button>
          </Link>
          <Link href="/student">
            <Button size="lg" variant="outline" className="gap-2">
              <User className="h-5 w-5" />
              View Credentials
            </Button>
          </Link>
          <Link href="/verifier">
            <Button size="lg" variant="outline" className="gap-2">
              <Shield className="h-5 w-5" />
              Verify Diplomas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
