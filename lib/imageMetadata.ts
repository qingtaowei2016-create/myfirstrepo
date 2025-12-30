import fs from 'fs'
import path from 'path'

export interface ImageMetadata {
  url: string
  order: number
  filename: string
}

export interface CaseStudyImages {
  overview: ImageMetadata[]
  research: ImageMetadata[]
  design: ImageMetadata[]
  results: ImageMetadata[]
}

const METADATA_FILENAME = 'images-metadata.json'

/**
 * Get the path to the metadata file for a case study
 */
function getMetadataPath(slug: string): string {
  const publicPath = path.join(process.cwd(), 'public', 'case-studies', slug)
  return path.join(publicPath, METADATA_FILENAME)
}

/**
 * Get the path to the images directory for a case study
 */
export function getImagesPath(slug: string): string {
  const publicPath = path.join(process.cwd(), 'public', 'case-studies', slug, 'images')
  return publicPath
}

/**
 * Read image metadata for a case study
 */
export function readImageMetadata(slug: string): CaseStudyImages {
  const metadataPath = getMetadataPath(slug)

  if (!fs.existsSync(metadataPath)) {
    return {
      overview: [],
      research: [],
      design: [],
      results: []
    }
  }

  try {
    const fileContent = fs.readFileSync(metadataPath, 'utf-8')
    const metadata = JSON.parse(fileContent) as CaseStudyImages
    return metadata
  } catch (error) {
    console.error('Error reading image metadata:', error)
    return {
      overview: [],
      research: [],
      design: [],
      results: []
    }
  }
}

/**
 * Write image metadata for a case study
 */
export function writeImageMetadata(slug: string, metadata: CaseStudyImages): void {
  const metadataPath = getMetadataPath(slug)
  const metadataDir = path.dirname(metadataPath)

  // Ensure directory exists
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true })
  }

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8')
}

/**
 * Add an image to a section
 */
export function addImageToSection(
  slug: string,
  section: keyof CaseStudyImages,
  imageUrl: string,
  filename: string
): void {
  const metadata = readImageMetadata(slug)
  const sectionImages = metadata[section]
  
  const newImage: ImageMetadata = {
    url: imageUrl,
    order: sectionImages.length,
    filename
  }

  sectionImages.push(newImage)
  writeImageMetadata(slug, metadata)
}

/**
 * Remove an image from a section
 */
export function removeImageFromSection(
  slug: string,
  section: keyof CaseStudyImages,
  filename: string
): void {
  const metadata = readImageMetadata(slug)
  const sectionImages = metadata[section]
  
  const filtered = sectionImages.filter(img => img.filename !== filename)
  
  // Reorder remaining images
  filtered.forEach((img, index) => {
    img.order = index
  })

  metadata[section] = filtered
  writeImageMetadata(slug, metadata)
}

/**
 * Get the public URL for an image
 */
export function getImagePublicUrl(slug: string, filename: string): string {
  return `/case-studies/${slug}/images/${filename}`
}

