'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageMetadata {
  url: string
  order: number
  filename: string
}

interface CaseStudyImagesProps {
  slug: string
  section: 'overview' | 'research' | 'design' | 'results'
}

export default function CaseStudyImages({ slug, section }: CaseStudyImagesProps) {
  const [images, setImages] = useState<ImageMetadata[]>([])

  useEffect(() => {
    loadImages()
    
    // Poll for updates every 2 seconds (for when admin uploads new images)
    const interval = setInterval(loadImages, 2000)
    return () => clearInterval(interval)
  }, [slug, section])

  const loadImages = async () => {
    try {
      const response = await fetch(`/api/admin/images?slug=${slug}`)
      const data = await response.json()
      const sectionImages = data[section] || []
      setImages(sectionImages.sort((a: ImageMetadata, b: ImageMetadata) => a.order - b.order))
    } catch (error) {
      console.error('Failed to load images:', error)
    }
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="space-y-6 my-6">
      {images.map((image) => (
        <div
          key={image.filename}
          className="relative w-full rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="relative aspect-video w-full">
            <Image
              src={image.url}
              alt={image.filename}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      ))}
    </div>
  )
}

