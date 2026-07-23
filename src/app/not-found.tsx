"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DocToolKitLogo } from "@/components/branding/doc-tool-kit-logo"
import { ArrowLeft, FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6">
        <DocToolKitLogo size="lg" />
      </div>

      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-6 shadow-inner">
        <FileQuestion className="h-8 w-8" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-muted-foreground text-sm max-w-md mb-8">
        The document tool or page you requested does not exist or has been moved.
      </p>

      <Link href="/dashboard">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-md">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>
    </div>
  )
}
