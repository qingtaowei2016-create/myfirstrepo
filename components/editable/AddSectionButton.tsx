'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SectionType } from '@/lib/caseStudyContent'

interface AddSectionButtonProps {
  slug: string
  onSectionAdded?: () => void
  position?: 'top' | 'bottom' | 'between'
}

export default function AddSectionButton({ slug, onSectionAdded, position = 'bottom' }: AddSectionButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  const sectionTypes: { type: SectionType; label: string; icon: string }[] = [
    { type: 'text', label: 'Text Section', icon: '📝' },
    { type: 'image', label: 'Image Section', icon: '🖼️' },
    { type: 'text-image', label: 'Text + Image', icon: '📄🖼️' }
  ]

  const handleAddSection = async (type: SectionType) => {
    if (loading) return

    setLoading(true)
    setShowMenu(false)

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'add-section',
          type
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // Trigger content reload
        if (onSectionAdded) {
          onSectionAdded()
        } else {
          // Fallback: dispatch custom event for CaseStudySections to listen
          window.dispatchEvent(new CustomEvent('section-added', { detail: { slug } }))
        }
      } else {
        alert(`Failed to add section: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to add section:', error)
      alert('Failed to add section. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowMenu(!showMenu)}
        variant="outline"
        size="sm"
        className="rounded-full px-6 py-3"
        disabled={loading}
      >
        {loading ? 'Adding...' : '+ Add Section'}
      </Button>

      {showMenu && !loading && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-full right-0 mt-2 bg-background border rounded-lg shadow-lg z-20 min-w-[200px]">
            {sectionTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleAddSection(type)}
                className="w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
              >
                <span>{icon}</span>
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
