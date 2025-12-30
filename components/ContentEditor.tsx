'use client'

import { useState, useEffect } from 'react'
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
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import {
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Section, SectionType, CaseStudyContent } from '@/lib/caseStudyContent'
import EditableSection from './editable/EditableSection'
import SectionProperties from './editable/SectionProperties'
import AddSectionButton from './editable/AddSectionButton'
import { Button } from '@/components/ui/button'

interface ContentEditorProps {
  slug: string
}

function SortableSection({
  section,
  isSelected,
  isEditing,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  slug
}: {
  section: Section
  isSelected: boolean
  isEditing: boolean
  onSelect: () => void
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
    <div ref={setNodeRef} style={style}>
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-4 cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 6H14M2 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex-1">
          <EditableSection
            section={section}
            isSelected={isSelected}
            isEditing={isEditing}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            slug={slug}
          />
        </div>
      </div>
    </div>
  )
}

export default function ContentEditor({ slug }: ContentEditorProps) {
  const [content, setContent] = useState<CaseStudyContent>({ sections: [] })
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  useEffect(() => {
    loadContent()
  }, [slug])

  const loadContent = async () => {
    try {
      const response = await fetch(`/api/admin/content?slug=${slug}`)
      const data = await response.json()
      setContent(data)
      return data
    } catch (error) {
      console.error('Failed to load content:', error)
      return null
    }
  }

  const handleUpdateSection = async (sectionId: string, updates: Partial<Section>) => {
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

      if (response.ok) {
        setHasChanges(true)
        // Update local state
        setContent(prev => ({
          sections: prev.sections.map(s =>
            s.id === sectionId ? { ...s, ...updates } : s
          )
        }))
      }
    } catch (error) {
      console.error('Failed to update section:', error)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'delete-section',
          sectionId
        })
      })

      if (response.ok) {
        await loadContent()
        setSelectedSectionId(null)
        setHasChanges(true)
      }
    } catch (error) {
      console.error('Failed to delete section:', error)
    }
  }

  const handleDuplicateSection = async (sectionId: string) => {
    const section = content.sections.find(s => s.id === sectionId)
    if (!section) return

    try {
      // Create a new section with same type
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
        // Update the new section with duplicated content
        await handleUpdateSection(data.section.id, {
          content: JSON.parse(JSON.stringify(section.content)),
          layout: { ...section.layout }
        })
        await loadContent()
        setSelectedSectionId(data.section.id)
        setHasChanges(true)
      }
    } catch (error) {
      console.error('Failed to duplicate section:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'save',
          content
        })
      })

      if (response.ok) {
        setHasChanges(false)
        // Reload to ensure sync
        await loadContent()
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save content. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = content.sections.findIndex(s => s.id === active.id)
      const newIndex = content.sections.findIndex(s => s.id === over.id)

      const newSections = arrayMove(content.sections, oldIndex, newIndex)
      const newOrder = newSections.map(s => s.id)

      setContent({ sections: newSections })
      setHasChanges(true)

      // Save reorder
      try {
        await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            action: 'reorder',
            order: newOrder
          })
        })
      } catch (error) {
        console.error('Failed to reorder:', error)
      }
    }
  }

  const selectedSection = content.sections.find(s => s.id === selectedSectionId) || null

  return (
    <div className="flex h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Content Editor</h2>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <span className="text-xs text-muted-foreground">Unsaved changes</span>
              )}
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                size="sm"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <AddSectionButton 
            slug={slug} 
            onSectionAdded={async () => {
              const data = await loadContent()
              setHasChanges(true)
              // Select the last section (newly added one)
              if (data && data.sections && data.sections.length > 0) {
                const lastSection = data.sections[data.sections.length - 1]
                setSelectedSectionId(lastSection.id)
                setIsEditing(true)
              }
            }} 
          />

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
                items={content.sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {content.sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      isSelected={selectedSectionId === section.id}
                      isEditing={isEditing && selectedSectionId === section.id}
                      onSelect={() => {
                        setSelectedSectionId(section.id)
                        setIsEditing(true) // Auto-enable editing when selecting
                      }}
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
        </div>
      </div>

      <SectionProperties
        section={selectedSection}
        onUpdate={(updates) => {
          if (selectedSectionId) {
            handleUpdateSection(selectedSectionId, updates)
          }
        }}
        onDelete={() => {
          if (selectedSectionId) {
            handleDeleteSection(selectedSectionId)
          }
        }}
        onDuplicate={() => {
          if (selectedSectionId) {
            handleDuplicateSection(selectedSectionId)
          }
        }}
      />
    </div>
  )
}

