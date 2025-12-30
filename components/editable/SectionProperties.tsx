'use client'

import { Section } from '@/lib/caseStudyContent'
import { Button } from '@/components/ui/button'

interface SectionPropertiesProps {
  section: Section | null
  onUpdate: (updates: Partial<Section>) => void
  onDelete: () => void
  onDuplicate: () => void
}

export default function SectionProperties({
  section,
  onUpdate,
  onDelete,
  onDuplicate
}: SectionPropertiesProps) {
  if (!section) {
    return (
      <div className="w-64 p-4 text-sm text-muted-foreground">
        Select a section to edit its properties
      </div>
    )
  }

  return (
    <div className="w-64 p-4 space-y-4 border-l bg-muted/30">
      <div>
        <h3 className="text-sm font-semibold mb-2">Section Type</h3>
        <p className="text-xs text-muted-foreground capitalize">{section.type}</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Alignment</label>
        <select
          value={section.layout.alignment}
          onChange={(e) => onUpdate({
            layout: {
              ...section.layout,
              alignment: e.target.value as 'left' | 'center' | 'right'
            }
          })}
          className="w-full px-2 py-1 text-sm border rounded"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Max Width</label>
        <select
          value={section.layout.maxWidth}
          onChange={(e) => onUpdate({
            layout: {
              ...section.layout,
              maxWidth: e.target.value as 'full' | '4xl' | '6xl' | '8xl'
            }
          })}
          className="w-full px-2 py-1 text-sm border rounded"
        >
          <option value="full">Full Width</option>
          <option value="4xl">4xl</option>
          <option value="6xl">6xl</option>
          <option value="8xl">8xl</option>
        </select>
      </div>

      {section.type === 'text-image' && (
        <div>
          <label className="text-sm font-medium mb-2 block">Image Position</label>
          <select
            value={(section.content as any).imagePosition || 'right'}
            onChange={(e) => onUpdate({
              content: {
                ...section.content,
                imagePosition: e.target.value as 'left' | 'right' | 'top' | 'bottom'
              } as any
            })}
            className="w-full px-2 py-1 text-sm border rounded"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      )}

      <div className="pt-4 border-t space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDuplicate}
          className="w-full"
        >
          Duplicate Section
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="w-full"
        >
          Delete Section
        </Button>
      </div>
    </div>
  )
}

