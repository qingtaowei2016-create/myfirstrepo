import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  readCaseStudyContent,
  writeCaseStudyContent,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  Section,
  SectionType
} from '@/lib/caseStudyContent'

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

  const content = readCaseStudyContent(slug)
  return NextResponse.json(content)
}

export async function POST(request: NextRequest) {
  // Check authentication
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { slug, action, ...data } = await request.json()

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug parameter' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'add-section':
        const { type } = data as { type: SectionType }
        if (!type) {
          return NextResponse.json(
            { error: 'Missing type parameter' },
            { status: 400 }
          )
        }
        const newSection = addSection(slug, type)
        return NextResponse.json({ success: true, section: newSection })

      case 'update-section':
        const { sectionId, updates } = data as { sectionId: string; updates: Partial<Section> }
        if (!sectionId) {
          return NextResponse.json(
            { error: 'Missing sectionId parameter' },
            { status: 400 }
          )
        }
        updateSection(slug, sectionId, updates)
        return NextResponse.json({ success: true })

      case 'delete-section':
        const { sectionId: deleteSectionId } = data as { sectionId: string }
        if (!deleteSectionId) {
          return NextResponse.json(
            { error: 'Missing sectionId parameter' },
            { status: 400 }
          )
        }
        deleteSection(slug, deleteSectionId)
        return NextResponse.json({ success: true })

      case 'reorder':
        const { order } = data as { order: string[] }
        if (!order || !Array.isArray(order)) {
          return NextResponse.json(
            { error: 'Missing or invalid order parameter' },
            { status: 400 }
          )
        }
        reorderSections(slug, order)
        return NextResponse.json({ success: true })

      case 'save':
        const { content } = data as { content: { sections: Section[] } }
        if (!content || !content.sections) {
          return NextResponse.json(
            { error: 'Missing content parameter' },
            { status: 400 }
          )
        }
        writeCaseStudyContent(slug, content)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

