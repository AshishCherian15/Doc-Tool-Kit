"use client"

export const dynamic = 'force-dynamic'

import { DocToolKitLogo } from '@/components/branding/doc-tool-kit-logo'
import { Suspense, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Upload, Copy, Download, ArrowLeft, Languages, User, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import * as pdfjsLib from 'pdfjs-dist'
import { createWorker } from 'tesseract.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function OCRPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [userEmail, setUserEmail] = useState('guest@doctoolkit.local')

  useEffect(() => {
    const savedEmail = localStorage.getItem("user_email")
    if (savedEmail) setUserEmail(savedEmail)
    const fname = searchParams.get('file')
    if (fname) autoLoadFile(fname)
  }, [])

  const autoLoadFile = async (fname: string) => {
    try {
      const res = await fetch(`/api/files?filename=${encodeURIComponent(fname)}`)
      if (!res.ok) return
      const blob = await res.blob()
      setFile(new File([blob], fname, { type: 'application/pdf' }))
      setExtractedText('')
    } catch {}
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('image')) {
      toast.error('Please select a PDF or image file')
      return
    }
    setFile(selectedFile)
    setExtractedText('')
  }

  const handleOCR = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setProcessing(true)
    setProgress(0)

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        }
      })

      let allText = ''

      if (file.type.includes('pdf')) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 2 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')

          if (!context) continue

          canvas.width = viewport.width
          canvas.height = viewport.height

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise

          const { data } = await worker.recognize(canvas)
          allText += `\n--- Page ${i} ---\n${data.text}`
        }
      } else {
        const { data } = await worker.recognize(file)
        allText = data.text
      }

      await worker.terminate()

      setExtractedText(allText)
      toast.success('Text extraction completed')
    } catch (error) {
      console.error('OCR error:', error)
      toast.error('Failed to extract text')
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText)
    toast.success('Text copied to clipboard')
  }

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted_text.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Text downloaded')
  }

  const handleLogout = () => {
    Cookies.remove('auth_token', { path: '/' })
    localStorage.removeItem('user_email')
    toast.success('Signed out safely')
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      {/* ── Navigation Header ── */}
      <nav className="border-b flex items-center justify-between px-8 py-4 bg-background">
        <Link href="/">
          <DocToolKitLogo size="md" />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Button
            size="sm"
            className="hover:opacity-90 text-white"
            style={{ background: "#2563EB", border: "none" }}
            asChild
          >
            <Link href="/dashboard">
              Open Workspace
            </Link>
          </Button>

          {/* ── Synchronized User Profile Dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted border hover:bg-muted/80">
                <User className="h-4 w-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1 shadow-md">
              <DropdownMenuLabel className="font-normal flex flex-col py-2 px-3">
                <span className="font-semibold text-sm">Workspace User</span>
                <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* ── Workspace ── */}
      <main className="flex-1 container mx-auto px-8 py-10">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="hover:bg-muted">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Controls Sandbox */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl tracking-tight flex items-center gap-2">
                <Languages className="h-5 w-5 text-emerald-600" />
                OCR Text Matrix Extraction
              </CardTitle>
              <CardDescription>Parse digital text coordinates out of raw image layers local-first via neural workers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Drop Input Area Trigger */}
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40 transition group">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
                  <p className="text-lg font-medium mb-1 truncate px-4">
                    {file ? file.name : 'Select PDF or Image'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {file ? `${(file.size / 1024).toFixed(1)} KB captured` : 'Supports formats like PDF, PNG, JPG, or WebP'}
                  </p>
                </div>
              </label>

              {/* Progress Pipeline Indicators */}
              {processing && (
                <div className="space-y-2 p-4 rounded-xl bg-muted/30 border animate-in fade-in duration-200">
                  <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                    <span>RECOGNIZING BUFFER STREAMS</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, backgroundColor: '#2563EB' }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Process Trigger */}
              <Button
                onClick={handleOCR}
                disabled={!file || processing}
                className="w-full text-white hover:opacity-90 h-11"
                style={{ backgroundColor: '#2563EB', border: 'none' }}
              >
                {processing ? 'Processing Optical Core Matrix...' : 'Initialize OCR Engine'}
              </Button>
            </CardContent>
          </Card>

          {/* Results Output Canvas Terminal */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl tracking-tight">Extracted Stream Outset</CardTitle>
              <CardDescription>Review, isolate, copy, or save generated alphanumeric vectors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={extractedText}
                readOnly
                placeholder="Alphanumeric raw character matrix will stream here after processing index calculations..."
                className="w-full h-[280px] p-4 border rounded-xl bg-muted/10 font-mono text-xs leading-relaxed focus:outline-none resize-none shadow-inner"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleCopy}
                  disabled={!extractedText}
                  variant="outline"
                  className="flex-1 h-10 border-input hover:bg-muted"
                >
                  <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                  Copy Text
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={!extractedText}
                  variant="outline"
                  className="flex-1 h-10 border-input hover:bg-muted"
                >
                  <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                  Save as .txt
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t px-8 py-6 mt-auto bg-background">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <DocToolKitLogo size="sm" />
            <p className="text-xs text-muted-foreground mt-1.5">
              © 2026 Doc Tool Kit &nbsp;·&nbsp; Built by Ashish
            </p>
          </div>
          <div className="flex gap-5">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}


export default function OCRPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <OCRPageContent />
    </Suspense>
  )
}
