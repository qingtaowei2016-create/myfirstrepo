import fs from 'fs'
import path from 'path'

export type SectionType = 'text' | 'image' | 'text-image'

export interface SectionLayout {
  alignment: 'left' | 'center' | 'right'
  maxWidth: 'full' | '4xl' | '6xl' | '8xl'
  imagePosition?: 'left' | 'right' | 'top' | 'bottom'
}

export interface TextSectionContent {
  header: string
  body: string
}

export interface ImageItem {
  id: string
  imageUrl: string
  alt: string
  caption?: string
}

export interface ImageSectionContent {
  images: ImageItem[]
}

export interface TextImageSectionContent {
  header: string
  body: string
  imageUrl: string
  alt: string
  imagePosition: 'left' | 'right' | 'top' | 'bottom'
}

export type SectionContent = TextSectionContent | ImageSectionContent | TextImageSectionContent

export interface Section {
  id: string
  type: SectionType
  order: number
  content: SectionContent
  layout: SectionLayout
}

export interface CaseStudyContent {
  sections: Section[]
}

const CONTENT_FILENAME = 'content.json'

/**
 * Get the path to the content file for a case study
 */
function getContentPath(slug: string): string {
  const publicPath = path.join(process.cwd(), 'public', 'case-studies', slug)
  return path.join(publicPath, CONTENT_FILENAME)
}

/**
 * Read content for a case study
 */
export function readCaseStudyContent(slug: string): CaseStudyContent {
  const contentPath = getContentPath(slug)

  if (!fs.existsSync(contentPath)) {
    return { sections: [] }
  }

  try {
    const fileContent = fs.readFileSync(contentPath, 'utf-8')
    const content = JSON.parse(fileContent) as CaseStudyContent
    return content
  } catch (error) {
    console.error('Error reading case study content:', error)
    return { sections: [] }
  }
}

/**
 * Write content for a case study
 */
export function writeCaseStudyContent(slug: string, content: CaseStudyContent): void {
  const contentPath = getContentPath(slug)
  const contentDir = path.dirname(contentPath)

  // Ensure directory exists
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true })
  }

  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf-8')
}

/**
 * Create a new section
 */
export function createSection(type: SectionType, order: number): Section {
  const id = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const baseLayout: SectionLayout = {
    alignment: 'left',
    maxWidth: '4xl'
  }

  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        order,
        content: {
          header: '',
          body: ''
        },
        layout: baseLayout
      }
    
    case 'image':
      return {
        id,
        type: 'image',
        order,
        content: {
          images: []
        },
        layout: {
          ...baseLayout,
          alignment: 'center'
        }
      }
    
    case 'text-image':
      return {
        id,
        type: 'text-image',
        order,
        content: {
          header: '',
          body: '',
          imageUrl: '',
          alt: '',
          imagePosition: 'right'
        },
        layout: {
          ...baseLayout,
          maxWidth: '6xl'
        }
      }
    
    default:
      throw new Error(`Unknown section type: ${type}`)
  }
}

/**
 * Update a section
 */
export function updateSection(slug: string, sectionId: string, updates: Partial<Section>): void {
  const content = readCaseStudyContent(slug)
  const sectionIndex = content.sections.findIndex(s => s.id === sectionId)
  
  if (sectionIndex === -1) {
    throw new Error(`Section ${sectionId} not found`)
  }

  content.sections[sectionIndex] = {
    ...content.sections[sectionIndex],
    ...updates
  }

  writeCaseStudyContent(slug, content)
}

/**
 * Delete a section
 */
export function deleteSection(slug: string, sectionId: string): void {
  const content = readCaseStudyContent(slug)
  const filtered = content.sections.filter(s => s.id !== sectionId)
  
  // Reorder remaining sections
  filtered.forEach((section, index) => {
    section.order = index
  })

  writeCaseStudyContent(slug, { sections: filtered })
}

/**
 * Reorder sections
 */
export function reorderSections(slug: string, newOrder: string[]): void {
  const content = readCaseStudyContent(slug)
  const sectionMap = new Map(content.sections.map(s => [s.id, s]))
  
  const reordered: Section[] = newOrder
    .map((id, index) => {
      const section = sectionMap.get(id)
      if (!section) return null
      return { ...section, order: index }
    })
    .filter((s): s is Section => s !== null)

  writeCaseStudyContent(slug, { sections: reordered })
}

/**
 * Add a new section
 */
export function addSection(slug: string, type: SectionType): Section {
  const content = readCaseStudyContent(slug)
  const newOrder = content.sections.length
  const newSection = createSection(type, newOrder)
  
  content.sections.push(newSection)
  writeCaseStudyContent(slug, content)
  
  return newSection
}

