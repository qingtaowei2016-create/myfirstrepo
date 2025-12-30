import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readImageMetadata, removeImageFromSection, getImagesPath, getImagePublicUrl } from '@/lib/imageMetadata'
import fs from 'fs'
import path from 'path'

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return !!session
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug parameter' },
      { status: 400 }
    )
  }

  const metadata = readImageMetadata(slug)
  return NextResponse.json(metadata)
}

export async function DELETE(request: NextRequest) {
  // Check authentication
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { slug, section, filename } = await request.json()

    if (!slug || !section || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, section, or filename' },
        { status: 400 }
      )
    }

    // Validate section
    const validSections = ['overview', 'research', 'design', 'results']
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
        { status: 400 }
      )
    }

    // Remove from metadata
    removeImageFromSection(slug, section as 'overview' | 'research' | 'design' | 'results', filename)

    // Delete physical file
    const imagesDir = getImagesPath(slug)
    const filePath = path.join(imagesDir, filename)
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}

