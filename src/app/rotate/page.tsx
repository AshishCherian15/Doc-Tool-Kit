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
import { Upload, Download, ArrowLeft, RotateCw, User, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { PDFService } from '@/services/pdfService'
import { downloadBlob, uint8ArrayToBlob } from '@/lib/utils'

type RotationAngle = 90 | 180 | 270

function RotateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [file, setFile] = useState<File | null>(null)
  const [angle, setAngle] = useState<RotationAngle>(90)
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
      setFile(new File([blob], fname, { type: 'application/pdf' }))
    } catch {}
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }
    setFile(selectedFile)
  }

  const handleRotate = async () => {
    if (!file) {
      toast.error('Please select a PDF file')
      return
    }

    setProcessing(true)
    try {
      const pdfBytes = await PDFService.rotatePDF(file, angle)
      downloadBlob(uint8ArrayToBlob(pdfBytes, 'application/pdf'), `rotated_${angle}deg_${file.name}`)
      toast.success(`PDF pages rotated by ${angle}°`)
    } catch (error) {
      console.error('Rotate error:', error)
      toast.error('Failed to rotate PDF')
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
              <RotateCw className="h-5 w-5 text-amber-600" /> Rotate PDF Pages
            </CardTitle>
            <CardDescription>Rotate all pages clockwise by 90, 180, or 270 degrees.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <label className="cursor-pointer block">
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40 transition group">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
                <p className="text-lg font-medium mb-1 truncate px-4">{file ? file.name : 'Select PDF File'}</p>
                <p className="text-sm text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB loaded` : 'Click to select PDF document'}</p>
              </div>
            </label>

            {file && (
              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border animate-in fade-in duration-200">
                <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block">Rotation Direction</label>
                <div className="grid grid-cols-3 gap-3">
                  {[90, 180, 270].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={angle === value ? 'default' : 'outline'}
                      onClick={() => setAngle(value as RotationAngle)}
                      style={angle === value ? { backgroundColor: '#2563EB', color: '#fff', border: 'none' } : {}}
                      className="w-full"
                    >
                      <RotateCw className="mr-2 h-4 w-4" /> {value}° Clockwise
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleRotate}
              disabled={!file || processing}
              className="w-full text-white hover:opacity-90 h-11"
              style={{ backgroundColor: '#2563EB', border: 'none' }}
            >
              <Download className="mr-2 h-4 w-4" />
              {processing ? 'Applying Page Rotations...' : 'Download Rotated PDF'}
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

export default function RotatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RotateContent />
    </Suspense>
  )
}
