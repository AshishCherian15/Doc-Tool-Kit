import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, pageNumber, type, content, x, y, width, height, color } = body

    const annotation = await prisma.annotation.create({
      data: {
        documentId,
        pageNumber,
        type,
        content,
        x,
        y,
        width,
        height,
        color,
      },
    })

    return NextResponse.json({ annotation })
  } catch (error) {
    console.error('Create annotation error:', error)
    return NextResponse.json({ error: 'Failed to create annotation' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    const annotations = await prisma.annotation.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ annotations })
  } catch (error) {
    console.error('Get annotations error:', error)
    return NextResponse.json({ error: 'Failed to fetch annotations' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Annotation ID required' }, { status: 400 })
    }

    await prisma.annotation.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete annotation error:', error)
    return NextResponse.json({ error: 'Failed to delete annotation' }, { status: 500 })
  }
}
