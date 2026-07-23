"use client"

import { DocToolKitLogo } from '@/components/branding/doc-tool-kit-logo'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, Search, FileText, User, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

interface SearchResult {
  documentId: string
  documentTitle: string
  page: number
  context: string
}

interface Document {
  id: string
  title: string
  fileSize: number
  pageCount: number
  createdAt: string
  filePath?: string
}

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [localDocs, setLocalDocs] = useState<Document[]>([])
  const [userEmail, setUserEmail] = useState('guest@doctoolkit.local')

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(data => setLocalDocs(data.documents || []))
      .catch(() => {})
    const savedEmail = localStorage.getItem('user_email')
    if (savedEmail) setUserEmail(savedEmail)
  }, [])

  const handleSearch = async () => {
    const q = query.trim().toLowerCase()
    if (!q) return
    setSearching(true)
    setResults([])
    const matches: SearchResult[] = []

    try {
      for (const doc of localDocs) {
        const rawPath = doc.filePath || ''
        const fname = rawPath.split(/[/\\]/).pop() || ''
        const fileUrl = `/api/files?filename=${encodeURIComponent(fname)}`

        try {
          const pdf = await pdfjsLib.getDocument(fileUrl).promise
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            const pageText = content.items.map((item: any) => item.str).join(' ')
            const lower = pageText.toLowerCase()
            const idx = lower.indexOf(q)
            if (idx === -1) continue
            const start = Math.max(0, idx - 60)
            const end = Math.min(pageText.length, idx + q.length + 80)
            let excerpt = pageText.substring(start, end).replace(/\s+/g, ' ').trim()
            if (start > 0) excerpt = '...' + excerpt
            if (end < pageText.length) excerpt = excerpt + '...'
            matches.push({ documentId: doc.id, documentTitle: doc.title, page: i, context: excerpt })
          }
        } catch {
          // skip unreadable docs
        }
      }
      setResults(matches)
      if (matches.length === 0) toast.info('No matches found')
    } catch {
      toast.error('Search failed')
    } finally {
      setSearching(false)
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
          <Button size="sm" className="hover:opacity-90 text-white" style={{ background: '#2563EB', border: 'none' }} asChild>
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
              <Search className="h-5 w-5 text-emerald-600" /> Search PDFs
            </CardTitle>
            <CardDescription>Searches the actual text content of all your uploaded PDFs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Type to search across all documents..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="h-11"
              />
              <Button onClick={handleSearch} disabled={searching || !query.trim()}
                className="text-white hover:opacity-90 h-11 px-6" style={{ backgroundColor: '#2563EB', border: 'none' }}>
                <Search className="mr-2 h-4 w-4" />
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          {searching && (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              <p className="text-sm text-muted-foreground">Reading PDF text content...</p>
            </div>
          )}

          {!searching && results.length === 0 && query.trim() && (
            <div className="text-center py-16 border rounded-xl bg-muted/10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-base text-muted-foreground font-medium">No matches found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search term.</p>
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">{results.length} match{results.length !== 1 ? 'es' : ''} found</p>
              {results.map((result, i) => (
                <Card key={i} className="hover:shadow-sm transition">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <FileText className="h-4 w-4" />
                      <CardTitle className="text-base font-semibold truncate">{result.documentTitle}</CardTitle>
                    </div>
                    <CardDescription className="text-xs pl-6">Page {result.page}</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-6">
                    <p className="text-sm bg-muted/40 p-3 rounded-lg border italic font-mono leading-relaxed">&quot;{result.context}&quot;</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
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
