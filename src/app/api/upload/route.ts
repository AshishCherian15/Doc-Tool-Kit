import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get page count
    const pdfDoc = await PDFDocument.load(buffer)
    const pageCount = pdfDoc.getPageCount()

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'storage', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filepath = join(uploadDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Save to database
    const document = await prisma.document.create({
      data: {
        title: file.name,
        originalFileName: file.name,
        filePath: `storage/uploads/${filename}`,
        fileSize: file.size,
        pageCount,
      },
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
