"use client"

export const dynamic = 'force-dynamic'

import { DocToolKitLogo } from '@/components/branding/doc-tool-kit-logo'
import { Suspense, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Upload, Download, ArrowLeft, Scissors, User, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { PDFDocument } from 'pdf-lib'

function SplitPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [splitType, setSplitType] = useState<'range' | 'every'>('range')
  const [startPage, setStartPage] = useState(1)
  const [endPage, setEndPage] = useState(1)
  const [everyN, setEveryN] = useState(1)
  const [splitting, setSplitting] = useState(false)
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
      const f = new File([blob], fname, { type: 'application/pdf' })
      setFile(f)
      const ab = await f.arrayBuffer()
      const pdf = await PDFDocument.load(ab)
      const count = pdf.getPageCount()
      setPageCount(count)
      setEndPage(count)
    } catch {}
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }

    setFile(selectedFile)

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const count = pdf.getPageCount()
      setPageCount(count)
      setEndPage(count)
    } catch (error) {
      toast.error('Failed to load PDF')
    }
  }

  const handleSplit = async () => {
    if (!file) {
      toast.error('Please select a PDF file')
      return
    }

    setSplitting(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      if (splitType === 'range') {
        const newPdf = await PDFDocument.create()
        const pages = await newPdf.copyPages(
          pdf,
          Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i)
        )
        pages.forEach(page => newPdf.addPage(page))

        const pdfBytes = await newPdf.save()
        const blob = new Blob([pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `split_${startPage}-${endPage}.pdf`
        a.click()
        
        URL.revokeObjectURL(url)
      } else {
        for (let i = 0; i < pageCount; i += everyN) {
          const newPdf = await PDFDocument.create()
          const endIdx = Math.min(i + everyN, pageCount)
          const pages = await newPdf.copyPages(
            pdf,
            Array.from({ length: endIdx - i }, (_, idx) => i + idx)
          )
          pages.forEach(page => newPdf.addPage(page))

          const pdfBytes = await newPdf.save()
          const blob = new Blob([pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          
          const a = document.createElement('a')
          a.href = url
          a.download = `split_part_${i + 1}-${endIdx}.pdf`
          a.click()
          
          URL.revokeObjectURL(url)
        }
      }

      toast.success('PDF split successfully')
    } catch (error) {
      console.error('Split error:', error)
      toast.error('Failed to split PDF')
    } finally {
      setSplitting(false)
    }
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

      {/* ── Workspace Content ── */}
      <main className="flex-1 container mx-auto px-8 py-10 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="hover:bg-muted">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight flex items-center gap-2">
              <Scissors className="h-5 w-5 text-emerald-600" />
              Split PDF
            </CardTitle>
            <CardDescription>Extract target components or partition arrays sequence-wise directly inside your browser sandbox.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Target Area File Drop Trigger */}
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40 transition group">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
                <p className="text-lg font-medium mb-1 truncate px-4">
                  {file ? file.name : 'Select PDF File'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {file ? `${pageCount} pages detected` : 'Click to map layout bounds'}
                </p>
              </div>
            </label>

            {/* Split Strategy Switches */}
            {file && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div className="flex gap-3">
                  <Button
                    variant={splitType === 'range' ? 'default' : 'outline'}
                    onClick={() => setSplitType('range')}
                    style={splitType === 'range' ? { backgroundColor: '#2563EB', color: '#fff', border: 'none' } : {}}
                    className="flex-1"
                  >
                    By Range
                  </Button>
                  <Button
                    variant={splitType === 'every' ? 'default' : 'outline'}
                    onClick={() => setSplitType('every')}
                    style={splitType === 'every' ? { backgroundColor: '#2563EB', color: '#fff', border: 'none' } : {}}
                    className="flex-1"
                  >
                    Every N Pages
                  </Button>
                </div>

                {/* Range Input Controls */}
                {splitType === 'range' ? (
                  <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block mb-2">Start Page</label>
                      <Input
                        type="number"
                        min={1}
                        max={pageCount}
                        value={startPage}
                        onChange={(e) => setStartPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                        className="bg-background"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block mb-2">End Page</label>
                      <Input
                        type="number"
                        min={1}
                        max={pageCount}
                        value={endPage}
                        onChange={(e) => setEndPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                        className="bg-background"
                      />
                    </div>
                  </div>
                ) : (
                  /* Cyclic Sequence Controls */
                  <div className="p-4 rounded-xl bg-muted/30 border">
                    <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block mb-2">Pages per file</label>
                    <Input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={everyN}
                      onChange={(e) => setEveryN(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                      className="bg-background"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Action Execution Layer */}
            <Button
              onClick={handleSplit}
              disabled={!file || splitting}
              className="w-full text-white hover:opacity-90 h-11"
              style={{ backgroundColor: '#2563EB', border: 'none' }}
            >
              <Download className="mr-2 h-4 w-4" />
              {splitting ? 'Executing Page Extraction Partition...' : 'Split Document'}
            </Button>
          </CardContent>
        </Card>
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


export default function SplitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SplitPageContent />
    </Suspense>
  )
}
