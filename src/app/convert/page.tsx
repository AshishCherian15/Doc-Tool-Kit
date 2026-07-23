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
import { Upload, Download, ArrowLeft, RefreshCw, User, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function ConvertPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [file, setFile] = useState<File | null>(null)
  const [convertType, setConvertType] = useState<'pdf-to-png' | 'pdf-to-jpg' | 'image-to-pdf' | 'pdf-to-word'>('pdf-to-png')
  const [converting, setConverting] = useState(false)
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
    } catch {}
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (convertType.startsWith('pdf-') && selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }

    if (convertType === 'image-to-pdf' && !selectedFile.type.includes('image')) {
      toast.error('Please select an image file')
      return
    }

    setFile(selectedFile)
  }

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setConverting(true)

    try {
      if (convertType === 'pdf-to-word') {
        // Extract text from all pages and build a .docx-like HTML file saved as .doc
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = `<html><body style="font-family:Arial,sans-serif;font-size:12pt;margin:40px;">`
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
          fullText += `<h3 style="color:#2563EB;border-bottom:1px solid #ccc;padding-bottom:4px;">Page ${i}</h3><p>${pageText}</p>`
        }
        fullText += `</body></html>`
        const blob = new Blob([fullText], { type: 'application/msword' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name.replace(/\.pdf$/i, '') + '.doc'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Converted to Word document')
      } else if (convertType === 'pdf-to-png' || convertType === 'pdf-to-jpg') {
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

          canvas.toBlob((blob) => {
            if (!blob) return
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `page_${i}.${convertType === 'pdf-to-png' ? 'png' : 'jpg'}`
            a.click()
            URL.revokeObjectURL(url)
          }, convertType === 'pdf-to-png' ? 'image/png' : 'image/jpeg')
        }

        toast.success('Conversion completed')
      } else {
        const pdfDoc = await PDFDocument.create()
        const imageBytes = await file.arrayBuffer()
        
        let image
        if (file.type.includes('png')) {
          image = await pdfDoc.embedPng(imageBytes)
        } else {
          image = await pdfDoc.embedJpg(imageBytes)
        }

        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        })

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = 'converted.pdf'
        a.click()
        
        URL.revokeObjectURL(url)
        toast.success('Conversion completed')
      }
    } catch (error) {
      console.error('Conversion error:', error)
      toast.error('Failed to convert file')
    } finally {
      setConverting(false)
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
              <RefreshCw className="h-5 w-5 text-emerald-600" />
              Convert File Formats
            </CardTitle>
            <CardDescription>
              Transform documents locally inside your client-side browser context without remote server processing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Conversion Option Toggles */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block">Conversion Matrix</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant={convertType === 'pdf-to-png' ? 'default' : 'outline'}
                  onClick={() => { setConvertType('pdf-to-png'); setFile(null); }}
                  style={convertType === 'pdf-to-png' ? { backgroundColor: '#2563EB', color: '#fff', border: 'none' } : {}}
                  className="w-full"
                >
                  PDF to PNG
                </Button>
                <Button
                  variant={convertType === 'pdf-to-jpg' ? 'default' : 'outline'}
                  onClick={() => { setConvertType('pdf-to-jpg'); setFile(null); }}
                  style={convertType === 'pdf-to-jpg' ? { backgroundColor: '#2563EB', color: '#fff', border: 'none' } : {}}
                  className="w-full"
                >
                  PDF to JPG
                </Button>
                <Button
                  variant={convertType === 'image-to-pdf' ? 'default' : 'outline'}
                  onClick={() => { setConvertType('image-to-pdf'); setFile(null); }}
                  style={convertType === 'image-to-pdf' ? { backgroundColor: '#2563EB', color: '#fff', border: 'none' } : {}}
                  className="w-full"
                >
                  Image to PDF
                </Button>
                <Button
                  variant={convertType === 'pdf-to-word' ? 'default' : 'outline'}
                  onClick={() => { setConvertType('pdf-to-word'); setFile(null); }}
                  style={convertType === 'pdf-to-word' ? { backgroundColor: '#2563EB', color: '#fff', border: 'none' } : {}}
                  className="w-full"
                >
                  PDF to Word (.doc)
                </Button>
              </div>
            </div>

            {/* Drag and Drop Trigger File Area */}
            <label className="cursor-pointer block">
              <input
                type="file"
                accept={convertType === 'image-to-pdf' ? 'image/*' : '.pdf'}
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40 transition group">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
                <p className="text-lg font-medium mb-1 truncate px-4">
                  {file ? file.name : `Select ${convertType === 'image-to-pdf' ? 'Image' : 'PDF'} File`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {file ? `${(file.size / 1024).toFixed(1)} KB loaded` : 'Click to map data buffers locally'}
                </p>
              </div>
            </label>

            {/* Execute Matrix Action Button */}
            <Button
              onClick={handleConvert}
              disabled={!file || converting}
              className="w-full text-white hover:opacity-90 h-11"
              style={{ backgroundColor: '#2563EB', border: 'none' }}
            >
              <Download className="mr-2 h-4 w-4" />
              {converting ? 'Processing Format Vector Layers...' : 'Run Format Conversion'}
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


export default function ConvertPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ConvertPageContent />
    </Suspense>
  )
}
