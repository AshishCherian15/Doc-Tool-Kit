"use client"

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { fabric } from 'fabric'
import * as pdfjsLib from 'pdfjs-dist'
import { Button } from '@/components/ui/button'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
const STANDARD_FONT_DATA_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/`

export interface PDFCanvasHandle {
  addText: () => void
  addWhiteout: () => void
  addHighlight: () => void
  setDrawMode: (on: boolean) => void
  setDrawColor: (color: string) => void
  setDrawWidth: (width: number) => void
  undo: () => void
  redo: () => void
  getCanvas: () => fabric.Canvas | null
  exportPNG: () => Promise<string | null>
  isReady: () => boolean
}

interface Props {
  documentPath: string
  pageNumber: number
  zoom: number
}

const PDFCanvas = forwardRef<PDFCanvasHandle, Props>(({ documentPath, pageNumber, zoom }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const pdfCanvasElementRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const loadingRef = useRef(false)
  const readyRef = useRef(false)

  const [pdfLoading, setPdfLoading] = useState(true)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 816, height: 1056 })

  const saveHistory = (fc: fabric.Canvas) => {
    const json = JSON.stringify(fc.toJSON(['data']))
    const sliced = historyRef.current.slice(0, historyIndexRef.current + 1)
    sliced.push(json)
    if (sliced.length > 50) sliced.shift()
    historyRef.current = sliced
    historyIndexRef.current = sliced.length - 1
  }

  useImperativeHandle(ref, () => ({
    addText: () => {
      const fc = fabricRef.current
      if (!fc) return
      const text = new fabric.IText('Type here', {
        left: Math.max(20, dimensions.width / 2 - 60),
        top: Math.max(20, dimensions.height / 2 - 12),
        fontSize: 20,
        fill: '#000000',
        fontFamily: 'Arial',
        padding: 4,
        data: { type: 'text' },
      })
      fc.add(text)
      fc.setActiveObject(text)
      fc.renderAll()
      text.enterEditing()
      text.selectAll()
      saveHistory(fc)
    },

    addWhiteout: () => {
      const fc = fabricRef.current
      if (!fc) return
      const rect = new fabric.Rect({
        left: 60, top: 60,
        width: 220, height: 44,
        fill: '#ffffff',
        stroke: '#cbd5e1', strokeWidth: 1,
        rx: 2, ry: 2,
        data: { type: 'whiteout' },
      })
      fc.add(rect)
      fc.setActiveObject(rect)
      fc.renderAll()
      saveHistory(fc)
    },

    addHighlight: () => {
      const fc = fabricRef.current
      if (!fc) return
      const rect = new fabric.Rect({
        left: 60, top: 60,
        width: 220, height: 26,
        fill: 'rgba(254,240,138,0.55)',
        stroke: 'rgba(202,138,4,0.3)', strokeWidth: 1,
        data: { type: 'highlight' },
      })
      fc.add(rect)
      fc.setActiveObject(rect)
      fc.renderAll()
      saveHistory(fc)
    },

    setDrawMode: (on: boolean) => {
      const fc = fabricRef.current
      if (!fc) return
      fc.isDrawingMode = on
    },

    setDrawColor: (color: string) => {
      const fc = fabricRef.current
      if (!fc) return
      if (fc.freeDrawingBrush) fc.freeDrawingBrush.color = color
    },

    setDrawWidth: (width: number) => {
      const fc = fabricRef.current
      if (!fc) return
      if (fc.freeDrawingBrush) fc.freeDrawingBrush.width = width
    },

    undo: () => {
      const fc = fabricRef.current
      if (!fc || historyIndexRef.current <= 0) return
      historyIndexRef.current -= 1
      fc.loadFromJSON(historyRef.current[historyIndexRef.current], () => {
        fc.renderAll()
      })
    },

    redo: () => {
      const fc = fabricRef.current
      if (!fc || historyIndexRef.current >= historyRef.current.length - 1) return
      historyIndexRef.current += 1
      fc.loadFromJSON(historyRef.current[historyIndexRef.current], () => {
        fc.renderAll()
      })
    },

    getCanvas: () => fabricRef.current,

    exportPNG: () => new Promise<string | null>((resolve) => {
      const fc = fabricRef.current
      const pdfCanvas = pdfCanvasElementRef.current
      if (!fc || !pdfCanvas) { resolve(null); return }
      
      fc.discardActiveObject()
      fc.renderAll()

      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = dimensions.width
      exportCanvas.height = dimensions.height
      const ctx = exportCanvas.getContext('2d')
      if (!ctx) { resolve(null); return }

      // Draw base PDF layer first
      ctx.drawImage(pdfCanvas, 0, 0)
      
      // Draw Fabric annotation overlay layer on top
      const fabricImg = new Image()
      fabricImg.onload = () => {
        ctx.drawImage(fabricImg, 0, 0)
        resolve(exportCanvas.toDataURL('image/png'))
      }
      fabricImg.onerror = () => {
        resolve(exportCanvas.toDataURL('image/png'))
      }
      fabricImg.src = fc.toDataURL({ format: 'png' })
    }),

    isReady: () => readyRef.current,
  }))

  // Mount Fabric Canvas on top layer
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const canvasEl = document.createElement('canvas')
    canvasEl.id = 'pdf-fabric-overlay'
    mount.appendChild(canvasEl)

    const fc = new fabric.Canvas(canvasEl, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: 'transparent',
      selection: true,
    })
    fabricRef.current = fc

    fc.on('object:modified', () => saveHistory(fc))
    fc.on('path:created', () => saveHistory(fc))

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if ((e.key === 'Delete' || e.key === 'Backspace') && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        const obj = fc.getActiveObject()
        if (obj) { fc.remove(obj); fc.discardActiveObject(); fc.renderAll(); saveHistory(fc) }
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      try { fc.dispose() } catch (_) {}
      fabricRef.current = null
      if (mount.contains(canvasEl)) mount.removeChild(canvasEl)
    }
  }, [])

  // Update Fabric canvas dimensions whenever PDF dimensions change
  useEffect(() => {
    const fc = fabricRef.current
    if (fc && (fc as any).lowerCanvasEl) {
      fc.setDimensions({ width: dimensions.width, height: dimensions.height })
      fc.renderAll()
    }
  }, [dimensions])

  // Load PDF page onto base canvas
  useEffect(() => {
    if (!documentPath) return
    loadPage()
  }, [documentPath, pageNumber, zoom])

  const loadPage = async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setPdfLoading(true)
    setPdfError(null)

    try {
      let pdfUrl = documentPath
      if (
        !documentPath.startsWith('blob:') &&
        !documentPath.startsWith('http://') &&
        !documentPath.startsWith('https://') &&
        !documentPath.startsWith('/api/')
      ) {
        pdfUrl = `/api/files?filename=${encodeURIComponent(documentPath)}`
      }

      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        standardFontDataUrl: STANDARD_FONT_DATA_URL,
      })
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: (zoom / 100) * 1.5 })

      const renderCanvas = pdfCanvasElementRef.current
      if (!renderCanvas) throw new Error('Canvas element not ready')

      const w = Math.floor(viewport.width)
      const h = Math.floor(viewport.height)
      setDimensions({ width: w, height: h })

      renderCanvas.width = w
      renderCanvas.height = h

      const ctx = renderCanvas.getContext('2d')
      if (!ctx) throw new Error('Could not get 2D context')

      await page.render({ canvasContext: ctx, viewport }).promise

      readyRef.current = true
      setPdfLoading(false)

      const fc = fabricRef.current
      if (fc && historyRef.current.length === 0) {
        const json = JSON.stringify(fc.toJSON(['data']))
        historyRef.current = [json]
        historyIndexRef.current = 0
      }
    } catch (err: any) {
      console.error('PDF load error:', err)
      setPdfError(err?.message ?? 'Failed to load PDF')
      setPdfLoading(false)
    } finally {
      loadingRef.current = false
    }
  }

  return (
    <div 
      className="relative shadow-2xl rounded-lg bg-white overflow-hidden"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      {/* Base Layer: Native PDF.js rendered vector canvas */}
      <canvas
        ref={pdfCanvasElementRef}
        className="absolute inset-0 z-0 block bg-white"
        style={{ width: dimensions.width, height: dimensions.height }}
      />

      {/* Overlay Layer: Fabric.js interactive annotation layer */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-10 pointer-events-auto"
        style={{ width: dimensions.width, height: dimensions.height }}
      />

      {/* Loading Overlay */}
      {pdfLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-9 w-9 border-4 border-[#2563EB] border-t-transparent rounded-full" />
            <p className="text-sm font-semibold text-muted-foreground">Rendering PDF page...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {pdfError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/95 p-6">
          <div className="text-center max-w-sm">
            <p className="text-red-500 font-bold mb-1">Failed to load PDF</p>
            <p className="text-xs text-muted-foreground font-mono mb-4 break-words">{pdfError}</p>
            <Button
              onClick={() => { setPdfError(null); loadPage() }}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  )
})

PDFCanvas.displayName = 'PDFCanvas'
export default PDFCanvas
