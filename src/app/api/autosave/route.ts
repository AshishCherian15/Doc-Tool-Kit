export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { getStorageDir, toStorageRelativePath } from '@/lib/storage-paths'

const AUTOSAVE_DIR = getStorageDir('autosave')
const EDITED_DIR = getStorageDir('edited')

// GET /api/autosave?documentId=xxx
// Returns the last saved annotation session (textNodes/whiteoutBlocks/highlights) as JSON.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
    }

    const sessionPath = join(AUTOSAVE_DIR, `${documentId}.json`)
    if (!existsSync(sessionPath)) {
      // No autosave yet — not an error, just nothing saved.
      return NextResponse.json(null)
    }

    const raw = await readFile(sessionPath, 'utf-8')
    return NextResponse.json(JSON.parse(raw))
  } catch (error) {
    console.error('Autosave GET error:', error)
    return NextResponse.json({ error: 'Failed to load autosave' }, { status: 500 })
  }
}

// POST /api/autosave
// Branches on Content-Type so it can safely handle BOTH:
//  1. multipart/form-data — an actual rendered PDF blob from the Fabric canvas
//     (fields: "file" = Blob, "path" = original document path)
//  2. application/json — lightweight annotation-session state
//     (body: { documentId, sessionData })
// This is the fix for: "SyntaxError: No number after minus sign in JSON at position 1"
// which happened because form-data bodies were previously force-parsed as JSON.
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const originalPath = formData.get('path') as string | null

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 })
      }

      if (!existsSync(EDITED_DIR)) {
        await mkdir(EDITED_DIR, { recursive: true })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const rawName = originalPath?.split('/').pop() || file.name || 'document.pdf'
      const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_')
      const destPath = join(EDITED_DIR, safeName)

      await writeFile(destPath, buffer)

      return NextResponse.json({
        success: true,
        savedTo: toStorageRelativePath('edited', safeName),
      })
    }

    // Fallback: JSON annotation-session save
    const body = await request.json()
    const { documentId, sessionData } = body

    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
    }

    if (!existsSync(AUTOSAVE_DIR)) {
      await mkdir(AUTOSAVE_DIR, { recursive: true })
    }

    const sessionPath = join(AUTOSAVE_DIR, `${documentId}.json`)
    // Save sessionData directly so GET returns it as a plain object
    const dataToSave = typeof sessionData === 'string' ? JSON.parse(sessionData) : (sessionData ?? {})
    await writeFile(sessionPath, JSON.stringify(dataToSave))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Autosave POST error:', error)
    return NextResponse.json({ error: 'Failed to process autosave request' }, { status: 500 })
  }
}