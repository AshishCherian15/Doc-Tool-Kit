"use client"

export const dynamic = 'force-dynamic'

import { DocToolKitLogo } from '@/components/branding/doc-tool-kit-logo'
import { useState, useEffect } from 'react'
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
import { Upload, Download, ArrowLeft, X, ArrowUp, ArrowDown, FolderPlus, User, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { PDFDocument } from 'pdf-lib'
import { ProcessingModal } from '@/components/ui/processing-modal'

interface StoredDocument {
  id: string
  title: string
  filePath: string
  pageCount: number
  fileSize: number
}

export default function MergePage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [workspaceDocs, setWorkspaceDocs] = useState<StoredDocument[]>([])
  const [merging, setMerging] = useState(false)
  const [userEmail, setUserEmail] = useState('guest@doctoolkit.local')

  useEffect(() => {
    const savedEmail = localStorage.getItem("user_email")
    if (savedEmail) setUserEmail(savedEmail)
    fetchWorkspaceDocs()
  }, [])

  const fetchWorkspaceDocs = async () => {
    try {
      const res = await fetch('/api/documents')
      if (res.ok) {
        const data = await res.json()
        setWorkspaceDocs(data.documents || [])
      }
    } catch {}
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const pdfFiles = selectedFiles.filter(f => f.type === 'application/pdf')
    
    if (pdfFiles.length !== selectedFiles.length) {
      toast.error('Only PDF files are allowed')
    }
    
    setFiles(prev => [...prev, ...pdfFiles])
  }

  const addWorkspaceDoc = async (doc: StoredDocument) => {
    const fname = doc.filePath.split(/[/\\]/).pop() || doc.title
    try {
      const res = await fetch(`/api/files?filename=${encodeURIComponent(fname)}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const file = new File([blob], doc.title, { type: 'application/pdf' })
      setFiles(prev => [...prev, file])
      toast.success(`Added "${doc.title}" to merge queue`)
    } catch {
      toast.error('Could not load workspace file')
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newFiles = [...files]
    ;[newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]
    setFiles(newFiles)
  }

  const moveDown = (index: number) => {
    if (index === files.length - 1) return
    const newFiles = [...files]
    ;[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
    setFiles(newFiles)
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please select at least 2 PDF files')
      return
    }

    setMerging(true)

    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
      }

      const mergedPdfBytes = await mergedPdf.save()
      const blob = new Blob([mergedPdfBytes.buffer.slice(mergedPdfBytes.byteOffset, mergedPdfBytes.byteOffset + mergedPdfBytes.byteLength) as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = 'merged.pdf'
      a.click()
      
      URL.revokeObjectURL(url)
      toast.success('PDFs merged successfully')
    } catch (error) {
      console.error('Merge error:', error)
      toast.error('Failed to merge PDFs')
    } finally {
      setMerging(false)
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
            <CardTitle className="text-2xl tracking-tight">Merge PDFs</CardTitle>
            <CardDescription>Combine multiple PDF documents sequentially entirely inside your browser tab.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="cursor-pointer flex-1">
                <input type="file" accept=".pdf" multiple onChange={handleFileSelect} className="hidden" />
                <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40 transition group h-full flex flex-col items-center justify-center">
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3 group-hover:text-foreground transition-colors" />
                  <p className="text-base font-medium mb-1">Upload Local PDFs</p>
                  <p className="text-xs text-muted-foreground">Click or drag files from device</p>
                </div>
              </label>

              {workspaceDocs.length > 0 && (
                <div className="border rounded-xl p-4 bg-muted/10 sm:w-72 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <FolderPlus className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace PDFs</span>
                  </div>
                  <div className="space-y-1.5 overflow-y-auto max-h-36 pr-1 flex-1">
                    {workspaceDocs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => addWorkspaceDoc(doc)}
                        className="w-full text-left p-2 rounded text-xs hover:bg-muted font-medium truncate border flex items-center justify-between group transition-colors"
                      >
                        <span className="truncate pr-2">{doc.title}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0 group-hover:text-foreground">+ Add</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-sm">Sequence Pipeline ({files.length})</h3>
                  <span className="text-xs text-muted-foreground">Top items resolve first</span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-background hover:shadow-sm transition">
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                        <span className="flex items-center justify-center text-xs font-semibold h-5 w-5 rounded-full bg-muted text-muted-foreground shrink-0">
                          {index + 1}
                        </span>
                        <span className="truncate text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline shrink-0">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveUp(index)} disabled={index === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveDown(index)} disabled={index === files.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleMerge}
              disabled={files.length < 2 || merging}
              className="w-full text-white hover:opacity-90 h-11"
              style={{ backgroundColor: '#2563EB', border: 'none' }}
            >
              <Download className="mr-2 h-4 w-4" />
              {merging ? 'Compiling Document Assembly...' : 'Merge PDFs Together'}
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
      <ProcessingModal
        isOpen={merging}
        title="Merging PDFs..."
        statusMessage="Combining selected document pages into a single PDF..."
      />
    </div>
  )
}
