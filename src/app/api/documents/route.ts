export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { prisma } from '@/lib/prisma'
import { resolveStoragePath } from '@/lib/storage-paths'

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    const document = await prisma.document.findUnique({ where: { id } })
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete file
    try {
      await unlink(resolveStoragePath(document.filePath))
    } catch (err) {
      console.error('Error deleting file:', err)
    }

    // Delete from database
    await prisma.document.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
