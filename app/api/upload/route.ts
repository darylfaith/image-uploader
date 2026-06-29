import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' }, { status: 400 })
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    })

    // Generate short reference ID
    let referenceId = generateShortId()
    let isUnique = false
    
    // Ensure uniqueness
    while (!isUnique) {
      const existing = await prisma.image.findUnique({
        where: { referenceId }
      })
      if (!existing) {
        isUnique = true
      } else {
        referenceId = generateShortId()
      }
    }

    // Save metadata to database
    const image = await prisma.image.create({
      data: {
        referenceId,
        filename: blob.pathname,
        originalName: file.name,
        url: blob.url,
        size: file.size,
      },
    })

    const shortUrl = `${request.nextUrl.origin}/img/${referenceId}`

    return NextResponse.json({
      id: image.id,
      referenceId: image.referenceId,
      shortUrl,
      filename: image.filename,
      originalName: image.originalName,
      url: image.url,
      size: image.size,
      uploadedAt: image.uploadedAt,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
