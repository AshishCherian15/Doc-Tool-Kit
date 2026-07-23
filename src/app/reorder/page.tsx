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
import { Upload, Download, ArrowLeft, ArrowUp, ArrowDown, Trash2, Layers, User, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { PDFDocument } from 'pdf-lib'
import { PDFService } from '@/services/pdfService'
import { downloadBlob, uint8ArrayToBlob } from '@/lib/utils'

function ReorderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [file, setFile] = useState<File | null>(null)
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [processing, setProcessing] = useState(false)
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
      loadPdfPages(f)
    } catch {}
  }

  const loadPdfPages = async (selectedFile: File) => {
    setFile(selectedFile)
    try {
      const pdf = await PDFDocument.load(await selectedFile.arrayBuffer())
      setPageOrder(Array.from({ length: pdf.getPageCount() }, (_, index) => index + 1))
    } catch {
      toast.error('Could not read this PDF')
      setPageOrder([])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }
    loadPdfPages(selectedFile)
  }

  const movePage = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= pageOrder.length) return
    const next = [...pageOrder]
    ;[next[index], next[target]] = [next[target], next[index]]
    setPageOrder(next)
  }

  const removePage = (index: number) => {
    if (pageOrder.length <= 1) {
      toast.error('Keep at least one page')
      return
    }
    setPageOrder(pageOrder.filter((_, pageIndex) => pageIndex !== index))
  }

  const handleReorder = async () => {
    if (!file || pageOrder.length === 0) {
      toast.error('Select a PDF first')
      return
    }

    setProcessing(true)
    try {
      const pdfBytes = await PDFService.reorderPages(file, pageOrder)
      downloadBlob(uint8ArrayToBlob(pdfBytes, 'application/pdf'), `reordered_${file.name}`)
      toast.success('Reordered PDF downloaded')
    } catch (error) {
      console.error('Reorder error:', error)
      toast.error('Failed to reorder PDF')
    } finally {
      setProcessing(false)
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
      <nav className="border-b flex items-center justify-between px-8 py-4 bg-background">
        <Link href="/"><DocToolKitLogo size="md" /></Link>
        <div className="flex items-center gap-6">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <Button size="sm" className="hover:opacity-90 text-white" style={{ background: "#2563EB", border: "none" }} asChild>
            <Link href="/dashboard">Open Workspace</Link>
          </Button>
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

      <main className="flex-1 container mx-auto px-8 py-10 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="hover:bg-muted">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" /> Reorder PDF Pages
            </CardTitle>
            <CardDescription>Move pages up or down, or remove pages before downloading.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <label className="cursor-pointer block">
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40 transition group">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
                <p className="text-lg font-medium mb-1 truncate px-4">{file ? file.name : 'Select PDF File'}</p>
                <p className="text-sm text-muted-foreground">{file ? `${pageOrder.length} pages indexed` : 'Click to select PDF document'}</p>
              </div>
            </label>

            {pageOrder.length > 0 && (
              <div className="space-y-2 rounded-xl border bg-muted/30 p-4 max-h-96 overflow-y-auto animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Page Sequence ({pageOrder.length})</span>
                  <span className="text-xs text-muted-foreground">Order resolves top to bottom</span>
                </div>
                {pageOrder.map((pageNumber, index) => (
                  <div key={`${pageNumber}-${index}`} className="flex items-center justify-between rounded-lg border bg-background px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-6 text-center">#{index + 1}</span>
                      <span className="text-sm font-medium">Page {pageNumber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePage(index, -1)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePage(index, 1)} disabled={index === pageOrder.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removePage(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleReorder}
              disabled={!file || pageOrder.length === 0 || processing}
              className="w-full text-white hover:opacity-90 h-11"
              style={{ backgroundColor: '#2563EB', border: 'none' }}
            >
              <Download className="mr-2 h-4 w-4" />
              {processing ? 'Compiling Reordered Document...' : 'Download Reordered PDF'}
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t px-8 py-6 mt-auto bg-background">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <DocToolKitLogo size="sm" />
            <p className="text-xs text-muted-foreground mt-1.5">© 2026 Doc Tool Kit · Built by Ashish</p>
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

export default function ReorderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ReorderContent />
    </Suspense>
  )
}
