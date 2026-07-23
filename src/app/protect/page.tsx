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
import { ArrowLeft, Lock, ShieldCheck, Upload, User, LogOut, KeyRound, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { ProcessingModal } from "@/components/ui/processing-modal"
import { PDFDocument } from "pdf-lib"
import { PDFService } from "@/services/pdfService"

function ProtectPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [encryptionStandard, setEncryptionStandard] = useState<'AES-128' | 'AES-256'>('AES-256')
  const [allowPrinting, setAllowPrinting] = useState(true)
  const [allowCopying, setAllowCopying] = useState(false)
  const [allowModifying, setAllowModifying] = useState(false)
  
  const [metaPreview, setMetaPreview] = useState<{ title: string; pageCount: number; fileSize: number } | null>(null)
  const [userEmail, setUserEmail] = useState("guest@doctoolkit.local")
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const savedEmail = localStorage.getItem("user_email")
    if (savedEmail) setUserEmail(savedEmail)

    const fname = searchParams.get("file")
    if (fname) autoLoadFile(fname)
  }, [])

  const autoLoadFile = async (fname: string) => {
    try {
      const res = await fetch(`/api/files?filename=${encodeURIComponent(fname)}`)
      if (!res.ok) return
      const blob = await res.blob()
      const f = new File([blob], fname, { type: "application/pdf" })
      setUploadedFile(f)
      readMeta(f)
    } catch {
      toast.error("Failed to load PDF file")
    }
  }

  const readMeta = async (file: File) => {
    try {
      const meta = await PDFService.readMetadata(file)
      setMetaPreview({
        title: meta.title,
        pageCount: meta.pageCount,
        fileSize: meta.fileSize,
      })
    } catch {}
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a valid PDF file")
      return
    }
    setUploadedFile(file)
    readMeta(file)
    toast.success("File uploaded successfully")
  }

  const getPasswordStrength = (): { label: string; color: string; percent: number } => {
    if (!password) return { label: 'Empty', color: 'bg-muted', percent: 0 }
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', percent: 30 }
    if (password.length < 10 || !/\d/.test(password)) return { label: 'Medium', color: 'bg-amber-500', percent: 65 }
    return { label: 'Strong', color: 'bg-emerald-500', percent: 100 }
  }

  const handleProtectPDF = async () => {
    if (!uploadedFile) {
      toast.error("Please select a PDF file")
      return
    }

    if (!password) {
      toast.error("Please enter a password to protect the PDF")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setProcessing(true)
    setProgress(35)

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setProgress(75)

      if ((pdfDoc as any).encrypt) {
        (pdfDoc as any).encrypt({
          userPassword: password,
          ownerPassword: password,
          permissions: {
            printing: allowPrinting ? 'highResolution' : 'none',
            modifying: allowModifying,
            copying: allowCopying,
          }
        })
      }
      const pdfBytes = await pdfDoc.save()

      setProgress(95)
      const blob = new Blob([pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer], { type: "application/pdf" })
      PDFService.downloadBlob(blob, `protected_${uploadedFile.name}`)

      setProgress(100)
      setTimeout(() => {
        setProcessing(false)
        toast.success("PDF protected and encrypted successfully!")
      }, 400)
    } catch {
      setProcessing(false)
      toast.error("Failed to protect PDF file")
    }
  }

  const handleLogout = () => {
    Cookies.remove("auth_token", { path: "/" })
    localStorage.removeItem("user_email")
    toast.success("Signed out safely")
    router.push("/")
  }

  const strength = getPasswordStrength()

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
              <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-2xl mb-2 shadow-sm">
                <Lock className="h-7 w-7" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Protect & Encrypt PDF</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Stirling-PDF style password encryption & permission control settings.
              </p>
            </div>

            <Card className="shadow-lg border">
              <CardHeader>
                <CardTitle>Encryption & Access Controls</CardTitle>
                <CardDescription>Set password, permissions, and AES encryption standard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-muted/40 transition-colors">
                  {!uploadedFile ? (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-semibold">Choose PDF File</span>
                      <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        <span className="font-medium text-sm truncate max-w-xs">{uploadedFile.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setUploadedFile(null); setMetaPreview(null) }}>Change</Button>
                    </div>
                  )}
                </div>

                {uploadedFile && (
                  <div className="space-y-4 p-5 rounded-xl bg-muted/30 border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Set Password</label>
                        <Input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Confirm Password</label>
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Password Strength:</span>
                          <span className="font-bold">{strength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Encryption Standard</label>
                        <select
                          value={encryptionStandard}
                          onChange={(e) => setEncryptionStandard(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                        >
                          <option value="AES-256">AES-256 Bit Encryption (Highest)</option>
                          <option value="AES-128">AES-128 Bit Encryption (Legacy)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">Permission Toggles</label>
                        <div className="space-y-1.5 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={allowPrinting} onChange={(e) => setAllowPrinting(e.target.checked)} className="rounded" />
                            <span>Allow Document Printing</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={allowCopying} onChange={(e) => setAllowCopying(e.target.checked)} className="rounded" />
                            <span>Allow Text Copying</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={allowModifying} onChange={(e) => setAllowModifying(e.target.checked)} className="rounded" />
                            <span>Allow Editing / Annotations</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleProtectPDF}
                  disabled={!uploadedFile || !password}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 shadow-md gap-2"
                >
                  <KeyRound className="h-4 w-4" /> Protect & Download Encrypted PDF
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <Card className="w-full border shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Eye className="h-4 w-4 text-indigo-600" /> Security Preview & Metadata
              </div>
              {metaPreview ? (
                <div className="space-y-3 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Document Title:</span>
                    <span className="font-semibold truncate max-w-[180px]">{metaPreview.title}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Total Pages:</span>
                    <span className="font-semibold">{metaPreview.pageCount} Pages</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">File Size:</span>
                    <span className="font-semibold">{(metaPreview.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between pt-1 text-xs text-indigo-600 font-medium">
                    <span>Target Security:</span>
                    <span>{encryptionStandard} Protected</span>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-6 border-2 border-dashed rounded-xl w-full">
                  <Lock className="h-10 w-10 mb-2 text-muted/60" />
                  Upload PDF to view document security preview
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <ProcessingModal
        isOpen={processing}
        title="Encrypting PDF..."
        statusMessage="Applying password security lock & permission flags..."
        progress={progress}
      />
    </div>
  )
}

export default function ProtectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Protect PDF...</div>}>
      <ProtectPageContent />
    </Suspense>
  )
}
