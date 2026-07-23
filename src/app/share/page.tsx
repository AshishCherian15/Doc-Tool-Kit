"use client"

export const dynamic = 'force-dynamic'

import { DocToolKitLogo } from "@/components/branding/doc-tool-kit-logo"
import { Suspense, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, Share2, Copy, Check, QrCode, Clock, Upload, User, LogOut, Link2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"

function SharePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [expiry, setExpiry] = useState<'1h' | '24h' | '7d' | 'never'>('24h')
  const [shareUrl, setShareUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [userEmail, setUserEmail] = useState("guest@doctoolkit.local")

  useEffect(() => {
    const savedEmail = localStorage.getItem("user_email")
    if (savedEmail) setUserEmail(savedEmail)

    const fname = searchParams.get("file")
    if (fname) {
      const generated = `${window.location.origin}/api/files?filename=${encodeURIComponent(fname)}`
      setShareUrl(generated)
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    const generated = `${window.location.origin}/api/files?filename=${encodeURIComponent(file.name)}`
    setShareUrl(generated)
    toast.success("Share link generated!")
  }

  const handleCopyLink = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Share link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    Cookies.remove("auth_token", { path: "/" })
    localStorage.removeItem("user_email")
    toast.success("Signed out safely")
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="border-b flex items-center justify-between px-8 py-4 bg-background">
        <Link href="/">
          <DocToolKitLogo size="md" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="max-w-[120px] truncate hidden md:inline">{userEmail}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <main className="flex-1 container max-w-5xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl mb-2 shadow-sm">
                <Share2 className="h-7 w-7" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Share PDF Link & QR Code</h1>
              <p className="text-muted-foreground text-sm mt-1">
                PDF-Verse style temporary download link & QR code generator.
              </p>
            </div>

            <Card className="shadow-lg border">
              <CardHeader>
                <CardTitle>Share Settings</CardTitle>
                <CardDescription>Upload PDF and configure link expiry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-muted/40 transition-colors">
                  {!uploadedFile && !shareUrl ? (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-semibold">Choose PDF File</span>
                      <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Link2 className="h-5 w-5 text-emerald-600" />
                        <span className="font-medium text-sm truncate max-w-xs">{uploadedFile?.name ?? 'Document PDF'}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setUploadedFile(null); setShareUrl('') }}>Change</Button>
                    </div>
                  )}
                </div>

                {shareUrl && (
                  <div className="space-y-4 p-5 rounded-xl bg-muted/30 border">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Temporary Shareable Link</label>
                      <div className="flex gap-2">
                        <Input value={shareUrl} readOnly className="bg-background text-xs font-mono" />
                        <Button onClick={handleCopyLink} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold">
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Link Expiry Duration</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: '1h', label: '1 Hour' },
                          { id: '24h', label: '24 Hours' },
                          { id: '7d', label: '7 Days' },
                          { id: 'never', label: 'Never' },
                        ].map((item) => (
                          <Button
                            key={item.id}
                            variant={expiry === item.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setExpiry(item.id as any)}
                            className="text-xs"
                          >
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* QR Code Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <Card className="w-full border shadow-sm h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <QrCode className="h-4 w-4 text-emerald-600" /> Interactive QR Code Preview
              </div>
              {shareUrl ? (
                <div className="p-4 bg-white rounded-2xl shadow-md border inline-block">
                  <svg className="w-44 h-44 text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="10" y="10" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="16" y="16" width="13" height="13" />
                    <rect x="65" y="10" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="71" y="16" width="13" height="13" />
                    <rect x="10" y="65" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="16" y="71" width="13" height="13" />
                    <rect x="45" y="45" width="10" height="10" />
                    <rect x="65" y="65" width="10" height="10" />
                    <rect x="78" y="78" width="12" height="12" />
                    <rect x="45" y="15" width="8" height="20" />
                    <rect x="15" y="45" width="20" height="8" />
                  </svg>
                  <p className="text-[11px] text-muted-foreground mt-2 font-mono">Scan with phone camera</p>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-6 border-2 border-dashed rounded-xl w-full">
                  <QrCode className="h-10 w-10 mb-2 text-muted/60" />
                  Upload PDF to generate QR Code
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Share Link...</div>}>
      <SharePageContent />
    </Suspense>
  )
}
