"use client"

export const dynamic = 'force-dynamic'

import { DocToolKitLogo } from "@/components/branding/doc-tool-kit-logo"
import { Suspense, useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft, 
  Type, 
  Eraser, 
  Highlighter, 
  PenTool, 
  Image as ImageIcon, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Undo, 
  Redo, 
  Upload, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  LogOut, 
  Settings, 
  Sparkles,
  Check
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"
import PDFCanvas, { PDFCanvasHandle } from "@/components/editor/pdf-canvas"
import TextToolbar from "@/components/editor/text-toolbar"
import { ProcessingModal } from "@/components/ui/processing-modal"
import { PDFDocument } from "pdf-lib"

function EditPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState("guest@doctoolkit.local")
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [zoom, setZoom] = useState<number>(100)
  
  const [activeTool, setActiveTool] = useState<"select" | "text" | "whiteout" | "highlight" | "draw">("select")
  const [drawColor, setDrawColor] = useState<string>("#2563EB")
  const [drawWidth, setDrawWidth] = useState<number>(3)
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processProgress, setProcessProgress] = useState<number>(0)
  
  const pdfCanvasRef = useRef<PDFCanvasHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    const savedEmail = localStorage.getItem("user_email")
    if (savedEmail) setUserEmail(savedEmail)

    const fname = searchParams.get("file")
    if (fname) autoLoadFile(fname)
  }, [])

  const autoLoadFile = async (fname: string) => {
    try {
      const res = await fetch(`/api/files?filename=${encodeURIComponent(fname)}`)
      if (!res.ok) return
      const blob = await res.blob()
      const f = new File([blob], fname, { type: "application/pdf" })
      
      const arrayBuffer = await blob.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setNumPages(pdfDoc.getPageCount())
      
      setUploadedFile(f)
      setFileUrl(URL.createObjectURL(f))
    } catch {
      toast.error("Failed to auto-load file")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("pdf")) {
      toast.error("Please upload a valid PDF file")
      return
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setNumPages(pdfDoc.getPageCount())
      
      setUploadedFile(file)
      setFileUrl(URL.createObjectURL(file))
      setCurrentPage(1)
      toast.success("PDF loaded for editing")
    } catch {
      toast.error("Failed to load PDF file")
    }
  }

  const handleLogout = () => {
    Cookies.remove("auth_token", { path: "/" })
    localStorage.removeItem("user_email")
    toast.success("Signed out safely")
    router.push("/login")
  }

  const handleAddText = () => {
    setActiveTool("text")
    pdfCanvasRef.current?.setDrawMode(false)
    pdfCanvasRef.current?.addText()
  }

  const handleAddWhiteout = () => {
    setActiveTool("whiteout")
    pdfCanvasRef.current?.setDrawMode(false)
    pdfCanvasRef.current?.addWhiteout()
  }

  const handleAddHighlight = () => {
    setActiveTool("highlight")
    pdfCanvasRef.current?.setDrawMode(false)
    pdfCanvasRef.current?.addHighlight()
  }

  const handleToggleDraw = () => {
    const nextState = activeTool !== "draw"
    setActiveTool(nextState ? "draw" : "select")
    pdfCanvasRef.current?.setDrawMode(nextState)
  }

  const handleDownloadEdited = async () => {
    if (!uploadedFile || !fileUrl) {
      toast.error("No file to export")
      return
    }

    setIsProcessing(true)
    setProcessProgress(20)

    try {
      // Get exported canvas data from fabric canvas
      const canvasPng = await pdfCanvasRef.current?.exportPNG()
      setProcessProgress(60)

      const existingBytes = await uploadedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(existingBytes)
      setProcessProgress(80)

      if (canvasPng) {
        const imageEmbed = await pdfDoc.embedPng(canvasPng)
        const pages = pdfDoc.getPages()
        const targetPage = pages[currentPage - 1]
        
        if (targetPage) {
          const { width, height } = targetPage.getSize()
          targetPage.drawImage(imageEmbed, {
            x: 0,
            y: 0,
            width,
            height,
          })
        }
      }

      setProcessProgress(95)
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer], { type: "application/pdf" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `edited_${uploadedFile.name}`
      link.click()

      setProcessProgress(100)
      setTimeout(() => {
        setIsProcessing(false)
        toast.success("Edited PDF downloaded successfully!")
      }, 500)
    } catch (err) {
      setIsProcessing(false)
      toast.error("Failed to export edited PDF")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <DocToolKitLogo size="md" />
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Edit PDF</span>
              <span>(Doc Tool Kit Editor)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
                <DropdownMenuItem className="text-xs text-muted-foreground">{userEmail}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Editor Sub-Toolbar */}
      <div className="bg-background border-b shadow-sm sticky top-16 z-30 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Sejda Action Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant={activeTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={handleAddText}
              disabled={!fileUrl}
              className="gap-1.5 text-xs font-medium"
            >
              <Type className="h-3.5 w-3.5 text-blue-500" /> Add Text
            </Button>

            <Button
              variant={activeTool === "whiteout" ? "default" : "outline"}
              size="sm"
              onClick={handleAddWhiteout}
              disabled={!fileUrl}
              className="gap-1.5 text-xs font-medium"
            >
              <Eraser className="h-3.5 w-3.5 text-amber-500" /> Whiteout / Erase
            </Button>

            <Button
              variant={activeTool === "highlight" ? "default" : "outline"}
              size="sm"
              onClick={handleAddHighlight}
              disabled={!fileUrl}
              className="gap-1.5 text-xs font-medium"
            >
              <Highlighter className="h-3.5 w-3.5 text-yellow-500" /> Highlight
            </Button>

            <Button
              variant={activeTool === "draw" ? "default" : "outline"}
              size="sm"
              onClick={handleToggleDraw}
              disabled={!fileUrl}
              className="gap-1.5 text-xs font-medium"
            >
              <PenTool className="h-3.5 w-3.5 text-indigo-500" /> Draw Pen
            </Button>

            {activeTool === "draw" && (
              <div className="flex items-center gap-2 pl-2 border-l">
                <input
                  type="color"
                  value={drawColor}
                  onChange={(e) => {
                    setDrawColor(e.target.value)
                    pdfCanvasRef.current?.setDrawColor(e.target.value)
                  }}
                  className="w-7 h-7 rounded border cursor-pointer"
                  title="Pen Color"
                />
              </div>
            )}
          </div>

          {/* Controls: Page navigation, Zoom & Export */}
          <div className="flex items-center gap-2">
            {fileUrl && (
              <div className="flex items-center gap-1 bg-secondary/60 rounded-lg px-2 py-1 border text-xs">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="font-semibold px-1">
                  Page {currentPage} / {numPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={currentPage >= numPages}
                  onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-1 border-l pl-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                disabled={!fileUrl}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-semibold w-10 text-center">{zoom}%</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom((z) => Math.min(200, z + 15))}
                disabled={!fileUrl}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              onClick={handleDownloadEdited}
              disabled={!fileUrl}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs font-semibold h-8 ml-2 shadow-md"
            >
              <Download className="h-3.5 w-3.5" /> Apply Changes & Download
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <main className="flex-1 container max-w-7xl mx-auto py-8 px-4 flex flex-col items-center">
        {!fileUrl ? (
          <Card className="w-full max-w-2xl p-12 border-dashed border-2 flex flex-col items-center justify-center text-center bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-6 shadow-inner">
              <FileText className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Upload a PDF to Edit</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Edit text, add annotations, erase sensitive content, and draw directly onto your PDF pages using our Sejda-powered editor engine.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-lg shadow-blue-500/20"
            >
              <Upload className="h-5 w-5" /> Choose PDF File
            </Button>
          </Card>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            <Card className="p-4 bg-background border shadow-xl rounded-2xl overflow-auto flex justify-center max-w-full">
              <PDFCanvas
                ref={pdfCanvasRef}
                documentPath={fileUrl}
                pageNumber={currentPage}
                zoom={zoom}
              />
            </Card>
          </div>
        )}
      </main>

      {/* Sejda Animated Processing Modal */}
      <ProcessingModal
        isOpen={isProcessing}
        title="Processing Edited PDF..."
        statusMessage="Embedding canvas layers and compiling PDF document..."
        progress={processProgress}
      />
    </div>
  )
}

export default function EditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading PDF Editor...</div>}>
      <EditPageContent />
    </Suspense>
  )
}
