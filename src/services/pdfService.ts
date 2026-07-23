import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'

export class PDFService {
  static async loadPDF(file: File | ArrayBuffer): Promise<PDFDocument> {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file
    return await PDFDocument.load(arrayBuffer)
  }

  static async mergePDFs(files: File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
      const pdf = await this.loadPDF(file)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
    }

    return await mergedPdf.save()
  }

  static async rotatePDF(file: File, angle: 90 | 180 | 270): Promise<Uint8Array> {
    const pdf = await this.loadPDF(file)
    pdf.getPages().forEach((page) => {
      const currentRotation = page.getRotation().angle
      page.setRotation(degrees((currentRotation + angle) % 360))
    })
    return await pdf.save()
  }

  static async addTextWatermark(
    file: File,
    watermark: string,
    options?: {
      colorRgb?: [number, number, number]
      opacity?: number
      size?: number
      rotation?: number
      fontName?: 'helvetica' | 'times' | 'courier'
      position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    }
  ): Promise<Uint8Array> {
    const pdf = await this.loadPDF(file)
    
    let fontChoice = StandardFonts.HelveticaBold
    if (options?.fontName === 'times') fontChoice = StandardFonts.TimesRomanBold
    if (options?.fontName === 'courier') fontChoice = StandardFonts.CourierBold

    const font = await pdf.embedFont(fontChoice)
    const [r, g, b] = options?.colorRgb ?? [0.15, 0.39, 0.92]
    const opacity = options?.opacity ?? 0.25
    const rot = options?.rotation ?? -28
    const pos = options?.position ?? 'center'

    pdf.getPages().forEach((page) => {
      const { width, height } = page.getSize()
      const fontSize = options?.size ?? Math.max(28, width / 14)
      const textWidth = font.widthOfTextAtSize(watermark, fontSize)

      let x = (width - textWidth) / 2
      let y = height / 2

      if (pos === 'top-left') { x = 40; y = height - 60 }
      else if (pos === 'top-right') { x = width - textWidth - 40; y = height - 60 }
      else if (pos === 'bottom-left') { x = 40; y = 60 }
      else if (pos === 'bottom-right') { x = width - textWidth - 40; y = 60 }

      page.drawText(watermark, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity: opacity,
        rotate: degrees(rot),
      })
    })

    return await pdf.save()
  }

  static async reorderPages(file: File, pageOrder: number[]): Promise<Uint8Array> {
    const pdf = await this.loadPDF(file)
    const newPdf = await PDFDocument.create()
    const indices = pageOrder.map((pageNumber) => pageNumber - 1)

    const pages = await newPdf.copyPages(pdf, indices)
    pages.forEach((page) => newPdf.addPage(page))

    return await newPdf.save()
  }

  static async extractPageImages(file: File, format: 'png' | 'jpeg' = 'png', scale = 2): Promise<{ page: number; blob: Blob }[]> {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const images: { page: number; blob: Blob }[] = []

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) continue

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport,
      }).promise

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, format === 'png' ? 'image/png' : 'image/jpeg', 0.92)
      })

      if (blob) {
        images.push({ page: pageNumber, blob })
      }
    }

    return images
  }

  static async readMetadata(file: File) {
    const pdf = await this.loadPDF(file)

    return {
      title: pdf.getTitle() ?? file.name,
      author: pdf.getAuthor() ?? 'Unknown',
      subject: pdf.getSubject() ?? '',
      creator: pdf.getCreator() ?? '',
      producer: pdf.getProducer() ?? '',
      pageCount: pdf.getPageCount(),
      fileSize: file.size,
      createdAt: pdf.getCreationDate() ?? null,
      updatedAt: pdf.getModificationDate() ?? null,
    }
  }

  static async updateMetadata(
    file: File,
    meta: { title?: string; author?: string; subject?: string; keywords?: string[] }
  ): Promise<Uint8Array> {
    const pdf = await this.loadPDF(file)
    if (meta.title !== undefined) pdf.setTitle(meta.title)
    if (meta.author !== undefined) pdf.setAuthor(meta.author)
    if (meta.subject !== undefined) pdf.setSubject(meta.subject)
    if (meta.keywords !== undefined) pdf.setKeywords(meta.keywords)

    return await pdf.save()
  }

  static async splitPDF(file: File, startPage: number, endPage: number): Promise<Uint8Array> {
    const pdf = await this.loadPDF(file)
    const newPdf = await PDFDocument.create()
    
    const pages = await newPdf.copyPages(
      pdf,
      Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i)
    )
    
    pages.forEach(page => newPdf.addPage(page))
    return await newPdf.save()
  }

  static async compressPDF(file: File, level: 'low' | 'medium' | 'high'): Promise<Uint8Array> {
    const pdf = await this.loadPDF(file)
    
    return await pdf.save({
      useObjectStreams: level !== 'low',
      addDefaultPage: false,
      objectsPerTick: level === 'high' ? 50 : 100,
    })
  }

  static async extractText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += `\n--- Page ${i} ---\n${pageText}`
    }

    return fullText
  }

  static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  static async addPageNumbers(
    file: File,
    options?: {
      position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'
      format?: 'number' | 'page-of-total' | 'confidential'
      size?: number
      fontName?: 'helvetica' | 'times' | 'courier'
      colorRgb?: [number, number, number]
    }
  ): Promise<Uint8Array> {
    const pdf = await this.loadPDF(file)
    let fontChoice = StandardFonts.Helvetica
    if (options?.fontName === 'times') fontChoice = StandardFonts.TimesRoman
    if (options?.fontName === 'courier') fontChoice = StandardFonts.Courier

    const font = await pdf.embedFont(fontChoice)
    const totalPages = pdf.getPageCount()
    const pos = options?.position ?? 'bottom-center'
    const fmt = options?.format ?? 'page-of-total'
    const fontSize = options?.size ?? 10
    const [r, g, b] = options?.colorRgb ?? [0.2, 0.2, 0.2]

    pdf.getPages().forEach((page, index) => {
      const pageNum = index + 1
      let text = `${pageNum}`
      if (fmt === 'page-of-total') text = `Page ${pageNum} of ${totalPages}`
      if (fmt === 'confidential') text = `CONFIDENTIAL - Page ${pageNum} of ${totalPages}`

      const textWidth = font.widthOfTextAtSize(text, fontSize)
      const { width, height } = page.getSize()

      let x = (width - textWidth) / 2
      let y = 20

      if (pos.includes('left')) x = 30
      if (pos.includes('right')) x = width - textWidth - 30
      if (pos.includes('top')) y = height - 30

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
      })
    })

    return await pdf.save()
  }

  static async redactArea(
    file: File,
    redactions: { pageIndex: number; x: number; y: number; width: number; height: number; fillColorRgb?: [number, number, number] }[]
  ): Promise<Uint8Array> {
    const pdf = await this.loadPDF(file)
    const pages = pdf.getPages()

    redactions.forEach((r) => {
      const page = pages[r.pageIndex]
      if (page) {
        const [cr, cg, cb] = r.fillColorRgb ?? [0, 0, 0]
        page.drawRectangle({
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          color: rgb(cr, cg, cb),
        })
      }
    })

    return await pdf.save()
  }
}
