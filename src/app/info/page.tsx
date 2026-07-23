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
import { Upload, ArrowLeft, BadgeInfo, User, LogOut, Download, Code, Save } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { PDFService } from '@/services/pdfService'
import { downloadBlob, uint8ArrayToBlob } from '@/lib/utils'

type MetadataResult = Awaited<ReturnType<typeof PDFService.readMetadata>>

function InfoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<MetadataResult | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editAuthor, setEditAuthor] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [editKeywords, setEditKeywords] = useState('')
  
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
      inspectPdf(f)
    } catch {}
  }

  const inspectPdf = async (selectedFile: File | undefined) => {
    if (!selectedFile) return
    setFile(selectedFile)
    try {
      const meta = await PDFService.readMetadata(selectedFile)
      setMetadata(meta)
      setEditTitle(meta.title)
      setEditAuthor(meta.author)
      setEditSubject(meta.subject)
      toast.success('PDF metadata loaded')
    } catch {
      toast.error('Could not read metadata from this PDF')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }
    inspectPdf(selectedFile)
  }

  const handleSaveMetadata = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const updatedBytes = await PDFService.updateMetadata(file, {
        title: editTitle,
        author: editAuthor,
        subject: editSubject,
        keywords: editKeywords ? editKeywords.split(',').map(k => k.trim()) : [],
      })
      downloadBlob(uint8ArrayToBlob(updatedBytes, 'application/pdf'), `meta_updated_${file.name}`)
      toast.success('Metadata updated and PDF downloaded!')
    } catch {
      toast.error('Failed to update PDF metadata')
    } finally {
      setProcessing(false)
    }
  }

  const handleExportJson = () => {
    if (!metadata || !file) return
    const jsonStr = JSON.stringify(metadata, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    downloadBlob(blob, `metadata_${file.name}.json`)
    toast.success('Exported metadata JSON')
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
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
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
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
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
              <BadgeInfo className="h-5 w-5 text-teal-600" /> PDF Metadata Editor & JSON Analytics
            </CardTitle>
            <CardDescription>Stirling-PDF style metadata editor and JSON export tool.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <label className="cursor-pointer block">
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/40 transition group">
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3 group-hover:text-foreground" />
                <p className="text-base font-semibold truncate px-4">{file ? file.name : 'Select PDF File'}</p>
                <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB loaded` : 'Click to inspect & edit document metadata'}</p>
              </div>
            </label>

            {metadata && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-5 text-sm">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Document Title</label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Author</label>
                    <Input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Subject</label>
                    <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Keywords (Comma Separated)</label>
                    <Input value={editKeywords} onChange={(e) => setEditKeywords(e.target.value)} placeholder="PDF, Document, Office" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleSaveMetadata}
                    disabled={processing}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold h-11 gap-2"
                  >
                    <Save className="h-4 w-4" /> Save Metadata & Export PDF
                  </Button>
                  <Button
                    onClick={handleExportJson}
                    variant="outline"
                    className="gap-2 h-11 font-semibold"
                  >
                    <Code className="h-4 w-4 text-teal-600" /> Export JSON
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function InfoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <InfoContent />
    </Suspense>
  )
}
