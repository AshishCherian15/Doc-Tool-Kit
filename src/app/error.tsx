"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DocToolKitLogo } from "@/components/branding/doc-tool-kit-logo"
import { RefreshCw, LayoutDashboard, AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App boundary error caught:", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6">
        <DocToolKitLogo size="lg" />
      </div>

      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-6 shadow-inner">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-muted-foreground text-sm max-w-md mb-6 break-words">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>

      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
        <Link href="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-md">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
