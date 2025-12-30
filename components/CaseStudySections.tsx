'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Section, CaseStudyContent } from '@/lib/caseStudyContent'
import EditableSection from './editable/EditableSection'
import { Button } from '@/components/ui/button'
import { useEditMode } from './EditModeProvider'
import ConfirmModal from '@/components/ui/confirm-modal'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CaseStudySectionsProps {
  slug: string
}

function SortableSectionItem({
  section,
  isEditing,
  onUpdate,
  onDelete,
  onDuplicate,
  slug
}: {
  section: Section
  isEditing: boolean
  onUpdate: (updates: Partial<Section>) => void
  onDelete: () => void
  onDuplicate: () => void
  slug: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <div className="flex items-start gap-2">
        {isEditing && (
          <div
            {...attributes}
            {...listeners}
            className="mt-4 cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded flex-shrink-0 touch-none"
            title="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 6H14M2 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        )}
        <div className="flex-1">
          {isEditing ? (
            <EditableSection
              section={section}
              isSelected={true}
              isEditing={true}
              onSelect={() => {}}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              slug={slug}
            />
          ) : (
            <ReadOnlySection section={section} />
          )}
        </div>
      </div>
    </div>
  )
}

function ReadOnlySection({ section }: { section: Section }) {
  const getMaxWidthClass = (maxWidth: string) => {
    switch (maxWidth) {
      case 'full': return 'max-w-full'
      case '4xl': return 'max-w-4xl'
      case '6xl': return 'max-w-6xl'
      case '8xl': return 'max-w-8xl'
      default: return 'max-w-4xl'
    }
  }

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'left': return 'text-left'
      case 'center': return 'text-center mx-auto'
      case 'right': return 'text-right ml-auto'
      default: return 'text-left'
    }
  }

  const maxWidthClass = getMaxWidthClass(section.layout.maxWidth)
  const alignmentClass = getAlignmentClass(section.layout.alignment)

  switch (section.type) {
    case 'text':
      const textContent = section.content as { header: string; body: string }
      return (
        <div className="rounded-3xl shadow-sm border bg-card">
          <div className="p-6">
            {textContent.header && (
              <h2 className="text-2xl font-semibold mb-4">{textContent.header}</h2>
            )}
            {textContent.body && (
              <div className={`${maxWidthClass} ${alignmentClass}`}>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {textContent.body}
                </p>
              </div>
            )}
          </div>
        </div>
      )

    case 'image':
      const imageContent = section.content as { images: Array<{ id: string; imageUrl: string; alt: string; caption?: string }> }
      const images = imageContent.images || []
      // Don't render empty image sections in read-only mode
      if (images.length === 0) {
        return null
      }
      return (
        <div className="rounded-3xl shadow-sm border bg-card">
          <div className="p-6">
            <div className={`${maxWidthClass} space-y-4`}>
              {images.map((img) => (
                <div key={img.id} className="space-y-2">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm">
                    <Image
                      src={img.imageUrl}
                      alt={img.alt}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  {img.caption && (
                    <p className="text-sm text-muted-foreground text-center">
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'text-image':
      const textImageContent = section.content as {
        header: string
        body: string
        imageUrl: string
        alt: string
        imagePosition: 'left' | 'right' | 'top' | 'bottom'
      }
      const isVertical = textImageContent.imagePosition === 'top' || textImageContent.imagePosition === 'bottom'
      const imageFirst = textImageContent.imagePosition === 'top' || textImageContent.imagePosition === 'left'

      return (
        <div className={`rounded-3xl shadow-sm border bg-card ${maxWidthClass}`}>
          <div className="p-6">
            <div className={isVertical ? 'space-y-4' : 'flex gap-6 items-start'}>
              {imageFirst && textImageContent.imageUrl && (
                <div className={isVertical ? 'w-full' : 'w-1/2'}>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={textImageContent.imageUrl}
                      alt={textImageContent.alt}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              <div className={isVertical ? 'w-full' : 'w-1/2'}>
                {textImageContent.header && (
                  <h2 className="text-2xl font-semibold mb-4">{textImageContent.header}</h2>
                )}
                {textImageContent.body && (
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {textImageContent.body}
                  </p>
                )}
              </div>

              {!imageFirst && textImageContent.imageUrl && (
                <div className={isVertical ? 'w-full' : 'w-1/2'}>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={textImageContent.imageUrl}
                      alt={textImageContent.alt}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

export default function CaseStudySections({ slug }: CaseStudySectionsProps) {
  const { editMode } = useEditMode()
  const [content, setContent] = useState<CaseStudyContent>({ sections: [] })
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const loadContent = async () => {
    try {
      const response = await fetch(`/api/admin/content?slug=${slug}`)
      const data = await response.json()
      setContent(data)
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSection = async (sectionId: string, updates: Partial<Section>) => {
    // Update local state immediately for better UX
    setContent(prev => ({
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      )
    }))

    // Auto-save to server
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'update-section',
          sectionId,
          updates
        })
      })

      if (!response.ok) {
        // Revert on error
        await loadContent()
        console.error('Failed to update section')
      }
    } catch (error) {
      console.error('Failed to update section:', error)
      // Revert on error
      await loadContent()
    }
  }

  const handleDeleteSection = (sectionId: string) => {
    setSectionToDelete(sectionId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'delete-section',
          sectionId: sectionToDelete
        })
      })

      if (response.ok) {
        await loadContent()
      }
    } catch (error) {
      console.error('Failed to delete section:', error)
    } finally {
      setShowDeleteConfirm(false)
      setSectionToDelete(null)
    }
  }

  const handleDuplicateSection = async (sectionId: string) => {
    const section = content.sections.find(s => s.id === sectionId)
    if (!section) return

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'add-section',
          type: section.type
        })
      })

      const data = await response.json()
      if (data.success) {
        await handleUpdateSection(data.section.id, {
          content: JSON.parse(JSON.stringify(section.content)),
          layout: { ...section.layout }
        })
        await loadContent()
      }
    } catch (error) {
      console.error('Failed to duplicate section:', error)
    }
  }

  useEffect(() => {
    loadContent()
  }, [slug])

  // Listen for section-added events to reload content
  useEffect(() => {
    const handleSectionAdded = (event: CustomEvent) => {
      if (event.detail?.slug === slug) {
        loadContent()
      }
    }

    window.addEventListener('section-added', handleSectionAdded as EventListener)
    
    return () => {
      window.removeEventListener('section-added', handleSectionAdded as EventListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // Get sorted sections
    const sortedSections = [...content.sections].sort((a, b) => a.order - b.order)
    const oldIndex = sortedSections.findIndex(s => s.id === active.id)
    const newIndex = sortedSections.findIndex(s => s.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const newSections = arrayMove(sortedSections, oldIndex, newIndex)
    
    // Update order values
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }))

    setContent({ sections: updatedSections })

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'reorder',
          order: updatedSections.map(s => s.id)
        })
      })

      if (!response.ok) {
        console.error('Failed to reorder sections')
        // Revert on error
        await loadContent()
      }
    } catch (error) {
      console.error('Failed to reorder:', error)
      // Revert on error
      await loadContent()
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>
  }

  if (!editMode) {
    // Read-only mode
    return (
      <div className="space-y-8">
        {content.sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <ReadOnlySection key={section.id} section={section} />
          ))}
      </div>
    )
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {content.sections.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No sections yet. Click "Add Section" to get started.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={[...content.sections].sort((a, b) => a.order - b.order).map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 pl-8">
              {[...content.sections]
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    isEditing={true}
                    onUpdate={(updates) => handleUpdateSection(section.id, updates)}
                    onDelete={() => handleDeleteSection(section.id)}
                    onDuplicate={() => handleDuplicateSection(section.id)}
                    slug={slug}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Are you sure you want to delete this section?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteSection}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setSectionToDelete(null)
        }}
      />
    </div>
  )
}

