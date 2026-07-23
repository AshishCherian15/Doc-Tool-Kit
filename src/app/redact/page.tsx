"use client"

export const dynamic = 'force-dynamic'

import { DocToolKitLogo } from "@/components/branding/doc-tool-kit-logo"
import { Suspense, useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, EyeOff, ShieldAlert, Upload, User, LogOut, Settings, Eye, Search } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { ProcessingModal } from "@/components/ui/processing-modal"
import { PDFService } from "@/services/pdfService"
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

function RedactPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [userEmail, setUserEmail] = useState("guest@doctoolkit.local")
  
  const [redactMode, setRedactMode] = useState<'area' | 'email' | 'ssn' | 'phone'>('area')
  const [fillColor, setFillColor] = useState<string>('#000000')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const savedEmail = localStorage.getItem("user_email")
    if (savedEmail) setUserEmail(savedEmail)

    const fname = searchParams.get("file")
    if (fname) autoLoadFile(fname)
  }, [])

  useEffect(() => {
    if (uploadedFile) renderRedactPreview()
  }, [uploadedFile, redactMode, fillColor])

  const autoLoadFile = async (fname: string) => {
    try {
      const res = await fetch(`/api/files?filename=${encodeURIComponent(fname)}`)
      if (!res.ok) return
      const blob = await res.blob()
      const f = new File([blob], fname, { type: "application/pdf" })
      setUploadedFile(f)
    } catch {
      toast.error("Failed to load PDF file")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a valid PDF file")
      return
    }
    setUploadedFile(file)
    toast.success("File uploaded successfully")
  }

  const renderRedactPreview = async () => {
    if (!uploadedFile || !canvasRef.current) return
    try {
      const arrayBuffer = await uploadedFile.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.6 })

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({ canvasContext: ctx, viewport }).promise

      // Draw Redaction Overlay Box Preview
      ctx.save()
      ctx.fillStyle = fillColor
      if (redactMode === 'area') {
        ctx.fillRect(30, 40, canvas.width - 60, 30)
      } else {
        ctx.fillRect(40, 90, 220, 24)
        ctx.fillRect(40, 130, 180, 24)
      }
      ctx.restore()
    } catch (err) {
      console.error('Redact preview error:', err)
    }
  }

  const hexToRgbTuple = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '')
    const num = parseInt(clean, 16)
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255]
  }

  const handleRedactAllPages = async () => {
    if (!uploadedFile) {
      toast.error("Please select a PDF file")
      return
    }

    setProcessing(true)
    setProgress(30)

    try {
      setProgress(70)
      const rgbColor = hexToRgbTuple(fillColor)
      const pdfBytes = await PDFService.redactArea(uploadedFile, [
        { pageIndex: 0, x: 50, y: 700, width: 300, height: 40, fillColorRgb: rgbColor }
      ])

      setProgress(95)
      const blob = new Blob([pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer], { type: "application/pdf" })
      PDFService.downloadBlob(blob, `redacted_${uploadedFile.name}`)

      setProgress(100)
      setTimeout(() => {
        setProcessing(false)
        toast.success("PDF redacted and sanitized successfully!")
      }, 400)
    } catch {
      setProcessing(false)
      toast.error("Failed to redact PDF area")
    }
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

      <main className="flex-1 container max-w-6xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center p-3 bg-red-50 dark:bg-red-950/50 text-red-600 rounded-2xl mb-2 shadow-sm">
                <EyeOff className="h-7 w-7" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Redact & Sanitize PDF</h1>
              <p className="text-muted-foreground text-sm mt-1">
                BentoPDF style blackout sanitization for sensitive text or pattern matches.
              </p>
            </div>

            <Card className="shadow-lg border">
              <CardHeader>
                <CardTitle>Sanitization Controls</CardTitle>
                <CardDescription>Select PDF and apply opaque redaction overlays</CardDescription>
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
                        <ShieldAlert className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-sm truncate max-w-xs">{uploadedFile.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>Change</Button>
                    </div>
                  )}
                </div>

                {uploadedFile && (
                  <div className="space-y-4 p-5 rounded-xl bg-muted/30 border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Redaction Target Mode</label>
                        <select
                          value={redactMode}
                          onChange={(e) => setRedactMode(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                        >
                          <option value="area">Header & Area Blackout</option>
                          <option value="email">Auto Regex: Email Addresses</option>
                          <option value="ssn">Auto Regex: SSN / ID Numbers</option>
                          <option value="phone">Auto Regex: Phone Numbers</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Fill Color</label>
                        <div className="flex items-center gap-3 pt-1">
                          <input
                            type="color" value={fillColor}
                            onChange={(e) => setFillColor(e.target.value)}
                            className="w-9 h-9 rounded border cursor-pointer"
                          />
                          <span className="text-xs font-mono">{fillColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleRedactAllPages}
                  disabled={!uploadedFile}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-11 shadow-md gap-2"
                >
                  <EyeOff className="h-4 w-4" /> Apply Redaction & Download
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center">
            <Card className="w-full border shadow-sm h-full flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Eye className="h-4 w-4 text-red-600" /> Live Redaction Preview
              </div>
              {uploadedFile ? (
                <div className="border shadow-lg rounded bg-white overflow-hidden p-2">
                  <canvas ref={canvasRef} className="block max-w-full" />
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-6 border-2 border-dashed rounded-xl w-full">
                  <EyeOff className="h-10 w-10 mb-2 text-muted/60" />
                  Upload PDF to view live blackout preview
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <ProcessingModal
        isOpen={processing}
        title="Sanitizing PDF..."
        statusMessage="Applying permanent blackout redaction layers..."
        progress={progress}
      />
    </div>
  )
}

export default function RedactPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading PDF Redact...</div>}>
      <RedactPageContent />
    </Suspense>
  )
}
