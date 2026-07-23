"use client"

export const dynamic = 'force-dynamic'

import { DocToolKitLogo } from '@/components/branding/doc-tool-kit-logo'
import { Suspense, useState, useEffect, useRef } from 'react'
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
import { Upload, Download, ArrowLeft, Droplets, User, LogOut, Settings, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { PDFService } from '@/services/pdfService'
import { downloadBlob, uint8ArrayToBlob } from '@/lib/utils'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

function WatermarkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL')
  const [fontName, setFontName] = useState<'helvetica' | 'times' | 'courier'>('helvetica')
  const [fontSize, setFontSize] = useState(48)
  const [hexColor, setHexColor] = useState('#2563EB')
  const [opacity, setOpacity] = useState(0.25)
  const [rotation, setRotation] = useState(-28)
  const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center')
  
  const [processing, setProcessing] = useState(false)
  const [userEmail, setUserEmail] = useState('guest@doctoolkit.local')

  useEffect(() => {
    const savedEmail = localStorage.getItem("user_email")
    if (savedEmail) setUserEmail(savedEmail)
    const fname = searchParams.get('file')
    if (fname) autoLoadFile(fname)
  }, [])

  useEffect(() => {
    if (file) renderWatermarkPreview()
  }, [file, watermarkText, fontName, fontSize, hexColor, opacity, rotation, position])

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

  const renderWatermarkPreview = async () => {
    if (!file || !canvasRef.current) return
    try {
      const arrayBuffer = await file.arrayBuffer()
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

      // Draw Watermark Overlay Preview
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = hexColor
      ctx.font = `bold ${fontSize * 0.6}px ${fontName === 'times' ? 'Times New Roman' : fontName === 'courier' ? 'Courier New' : 'sans-serif'}`

      const textMetrics = ctx.measureText(watermarkText)
      let x = (canvas.width - textMetrics.width) / 2
      let y = canvas.height / 2

      if (position === 'top-left') { x = 30; y = 50 }
      else if (position === 'top-right') { x = canvas.width - textMetrics.width - 30; y = 50 }
      else if (position === 'bottom-left') { x = 30; y = canvas.height - 30 }
      else if (position === 'bottom-right') { x = canvas.width - textMetrics.width - 30; y = canvas.height - 30 }

      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.fillText(watermarkText, 0, 0)
      ctx.restore()
    } catch (err) {
      console.error('Preview render error:', err)
    }
  }

  const hexToRgbTuple = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '')
    const num = parseInt(clean, 16)
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255]
  }

  const handleWatermark = async () => {
    if (!file) {
      toast.error('Please select a PDF file')
      return
    }

    if (!watermarkText.trim()) {
      toast.error('Please enter watermark text')
      return
    }

    setProcessing(true)
    try {
      const pdfBytes = await PDFService.addTextWatermark(
        file,
        watermarkText.trim(),
        {
          colorRgb: hexToRgbTuple(hexColor),
          opacity: opacity,
          size: fontSize,
          rotation: rotation,
          fontName: fontName,
          position: position,
        }
      )
      downloadBlob(uint8ArrayToBlob(pdfBytes, 'application/pdf'), `watermarked_${file.name}`)
      toast.success('Watermark added successfully')
    } catch (error) {
      console.error('Watermark error:', error)
      toast.error('Failed to add watermark')
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

      <main className="flex-1 container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="hover:bg-muted">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Customization Options Sidebar */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl tracking-tight flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-600" /> Watermark PDF Customizer
                </CardTitle>
                <CardDescription>Stirling-PDF style stamp customizer with real-time canvas preview.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <label className="cursor-pointer block">
                  <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                  <div className="border-2 border-dashed rounded-xl p-6 text-center bg-muted/20 hover:bg-muted/40 transition group">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2 group-hover:text-foreground" />
                    <p className="text-sm font-semibold truncate">{file ? file.name : 'Select PDF File'}</p>
                    <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB loaded` : 'Click to select PDF document'}</p>
                  </div>
                </label>

                {file && (
                  <div className="space-y-4 p-5 rounded-xl bg-muted/30 border">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Watermark Text</label>
                      <Input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="CONFIDENTIAL" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Font Family</label>
                        <select
                          value={fontName}
                          onChange={(e) => setFontName(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                        >
                          <option value="helvetica">Helvetica Bold</option>
                          <option value="times">Times Roman Bold</option>
                          <option value="courier">Courier Bold</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Position Preset</label>
                        <select
                          value={position}
                          onChange={(e) => setPosition(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                        >
                          <option value="center">Center Diagonal</option>
                          <option value="top-left">Top Left</option>
                          <option value="top-right">Top Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-right">Bottom Right</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                          Font Size ({fontSize}pt)
                        </label>
                        <input
                          type="range" min="12" max="120" value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                          Rotation ({rotation}°)
                        </label>
                        <input
                          type="range" min="-180" max="180" value={rotation}
                          onChange={(e) => setRotation(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                          Opacity ({Math.round(opacity * 100)}%)
                        </label>
                        <input
                          type="range" min="0.05" max="1" step="0.05" value={opacity}
                          onChange={(e) => setOpacity(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Color Picker</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color" value={hexColor}
                            onChange={(e) => setHexColor(e.target.value)}
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                          <span className="text-xs font-mono">{hexColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleWatermark}
                  disabled={!file || processing}
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 h-11 shadow-md font-semibold"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {processing ? 'Applying Watermark Layer...' : 'Download Watermarked PDF'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Live Canvas Preview Column */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <Card className="w-full border shadow-sm h-full flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Eye className="h-4 w-4 text-blue-600" /> Live Page Preview
              </div>
              {file ? (
                <div className="border shadow-lg rounded bg-white overflow-hidden p-2">
                  <canvas ref={canvasRef} className="block max-w-full" />
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-6 border-2 border-dashed rounded-xl w-full">
                  <Droplets className="h-10 w-10 mb-2 text-muted/60" />
                  Upload PDF to view live watermark preview
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function WatermarkPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WatermarkContent />
    </Suspense>
  )
}
