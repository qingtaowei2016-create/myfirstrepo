'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Section, SectionType } from '@/lib/caseStudyContent'

interface EditableSectionProps {
  section: Section
  isSelected: boolean
  isEditing: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<Section>) => void
  onDelete: () => void
  onDuplicate: () => void
  slug: string
}

export default function EditableSection({
  section,
  isSelected,
  isEditing,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  slug
}: EditableSectionProps) {
  const [localContent, setLocalContent] = useState(section.content)
  const headerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalContent(section.content)
  }, [section.content])

  const handleContentChange = (field: string, value: string) => {
    const updated = { ...localContent, [field]: value }
    setLocalContent(updated)
    onUpdate({ content: updated as any })
  }

  const saveCursorPosition = (element: HTMLElement) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null
    
    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(element)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    return preCaretRange.toString().length
  }

  const restoreCursorPosition = (element: HTMLElement, position: number) => {
    const selection = window.getSelection()
    if (!selection) return
    
    const range = document.createRange()
    let charCount = 0
    let nodeStack: Node[] = [element]
    let node: Node | undefined
    let foundStart = false
    
    while (!foundStart && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + (node.textContent?.length || 0)
        if (position <= nextCharCount) {
          range.setStart(node, position - charCount)
          range.setEnd(node, position - charCount)
          foundStart = true
        } else {
          charCount = nextCharCount
        }
      } else {
        let i = node.childNodes.length
        while (i--) {
          nodeStack.push(node.childNodes[i])
        }
      }
    }
    
    if (foundStart) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent Enter from creating new lines in headers
    if (e.currentTarget === headerRef.current && e.key === 'Enter') {
      e.preventDefault()
      bodyRef.current?.focus()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageId?: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('slug', slug)
    formData.append('section', 'overview') // Default section for content editor images

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        if (section.type === 'image') {
          // Handle multiple images
          const imageContent = localContent as { images: Array<{ id: string; imageUrl: string; alt: string; caption?: string }> }
          const images = imageContent.images || []
          
          if (imageId) {
            // Replace existing image
            const updated = {
              ...localContent,
              images: images.map(img => 
                img.id === imageId 
                  ? { ...img, imageUrl: data.url, alt: file.name }
                  : img
              )
            }
            setLocalContent(updated)
            onUpdate({ content: updated as any })
          } else {
            // Add new image
            const newImage = {
              id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              imageUrl: data.url,
              alt: file.name,
              caption: ''
            }
            const updated = {
              ...localContent,
              images: [...images, newImage]
            }
            setLocalContent(updated)
            onUpdate({ content: updated as any })
          }
        } else if (section.type === 'text-image') {
          // Handle single image for text-image sections
          const updated = {
            ...localContent,
            imageUrl: data.url,
            alt: file.name
          }
          setLocalContent(updated)
          onUpdate({ content: updated as any })
        }
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
    
    // Reset input so same file can be uploaded again
    e.target.value = ''
  }

  const handleRemoveImage = (imageId: string) => {
    if (section.type === 'image') {
      const imageContent = localContent as { images: Array<{ id: string; imageUrl: string; alt: string; caption?: string }> }
      const updated = {
        ...localContent,
        images: imageContent.images.filter(img => img.id !== imageId)
      }
      setLocalContent(updated)
      onUpdate({ content: updated as any })
    }
  }

  const handleUpdateImage = (imageId: string, field: string, value: string) => {
    if (section.type === 'image') {
      const imageContent = localContent as { images: Array<{ id: string; imageUrl: string; alt: string; caption?: string }> }
      const updated = {
        ...localContent,
        images: imageContent.images.map(img =>
          img.id === imageId ? { ...img, [field]: value } : img
        )
      }
      setLocalContent(updated)
      onUpdate({ content: updated as any })
    }
  }

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

  const renderSection = () => {
    switch (section.type) {
      case 'text':
        const textContent = section.content as { header: string; body: string }
        return (
          <div className={`${maxWidthClass} ${alignmentClass}`}>
            {isEditing ? (
              <>
                <div
                  ref={headerRef}
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={(e) => {
                    const currentText = (localContent as any).header || ''
                    if (!currentText && e.currentTarget.textContent?.includes('Enter header')) {
                      e.currentTarget.textContent = ''
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onInput={(e) => {
                    const element = e.currentTarget
                    const cursorPos = saveCursorPosition(element)
                    const text = element.textContent || ''
                    const currentText = (localContent as any).header || ''
                    
                    if (text !== currentText) {
                      const updated = { ...localContent, header: text }
                      setLocalContent(updated)
                      onUpdate({ content: updated as any })
                      
                      // Restore cursor position
                      setTimeout(() => {
                        if (cursorPos !== null && cursorPos !== undefined) {
                          restoreCursorPosition(element, cursorPos)
                        }
                      }, 0)
                    }
                  }}
                  onBlur={(e) => {
                    const text = e.currentTarget.textContent?.trim() || ''
                    handleContentChange('header', text)
                    // Show placeholder if empty
                    if (!text) {
                      e.currentTarget.textContent = 'Enter header...'
                      e.currentTarget.classList.add('text-muted-foreground/50')
                    } else {
                      e.currentTarget.classList.remove('text-muted-foreground/50')
                    }
                  }}
                  className={`text-2xl font-semibold mb-4 outline-none focus:ring-2 focus:ring-primary rounded px-2 -mx-2 cursor-text ${!(localContent as any).header ? 'text-muted-foreground/50' : ''}`}
                  style={{ minHeight: '1.5rem' }}
                >
                  {(localContent as any).header || 'Enter header...'}
                </div>
                <div
                  ref={bodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={(e) => {
                    const currentText = (localContent as any).body || ''
                    if (!currentText && e.currentTarget.textContent?.includes('Enter body')) {
                      e.currentTarget.textContent = ''
                    }
                  }}
                  onInput={(e) => {
                    const element = e.currentTarget
                    const cursorPos = saveCursorPosition(element)
                    const text = element.textContent || ''
                    const currentText = (localContent as any).body || ''
                    
                    if (text !== currentText) {
                      const updated = { ...localContent, body: text }
                      setLocalContent(updated)
                      onUpdate({ content: updated as any })
                      
                      // Restore cursor position
                      setTimeout(() => {
                        if (cursorPos !== null && cursorPos !== undefined) {
                          restoreCursorPosition(element, cursorPos)
                        }
                      }, 0)
                    }
                  }}
                  onBlur={(e) => {
                    const text = e.currentTarget.textContent?.trim() || ''
                    handleContentChange('body', text)
                    // Show placeholder if empty
                    if (!text) {
                      e.currentTarget.textContent = 'Enter body text...'
                      e.currentTarget.classList.add('text-muted-foreground/50')
                    } else {
                      e.currentTarget.classList.remove('text-muted-foreground/50')
                    }
                  }}
                  className={`text-base leading-relaxed text-muted-foreground outline-none focus:ring-2 focus:ring-primary rounded px-2 -mx-2 cursor-text ${!(localContent as any).body ? 'text-muted-foreground/50' : ''}`}
                  style={{ minHeight: '2rem' }}
                >
                  {(localContent as any).body || 'Enter body text...'}
                </div>
              </>
            ) : (
              <>
                {textContent.header && (
                  <h2 className="text-2xl font-semibold mb-4">{textContent.header}</h2>
                )}
                {textContent.body && (
                  <p className="text-base leading-relaxed text-muted-foreground">{textContent.body}</p>
                )}
              </>
            )}
          </div>
        )

      case 'image':
        const imageContent = section.content as { images: Array<{ id: string; imageUrl: string; alt: string; caption?: string }> }
        const images = (localContent as any)?.images || imageContent.images || []
        return (
          <div className={maxWidthClass}>
            {isEditing ? (
              <div className="space-y-4">
                {images.length > 0 && (
                  <div className="space-y-4">
                    {images.map((img: any, index: number) => (
                      <div key={img.id} className="space-y-2">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                          <Image
                            src={img.imageUrl}
                            alt={img.alt || 'Uploaded image'}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, img.id)}
                              className="hidden"
                              id={`image-replace-${section.id}-${img.id}`}
                            />
                            <label
                              htmlFor={`image-replace-${section.id}-${img.id}`}
                              className="px-2 py-1 bg-background/80 border rounded text-xs cursor-pointer hover:bg-background"
                            >
                              Replace
                            </label>
                            <button
                              onClick={() => handleRemoveImage(img.id)}
                              className="px-2 py-1 bg-background/80 border rounded text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={img.alt || ''}
                          onChange={(e) => handleUpdateImage(img.id, 'alt', e.target.value)}
                          placeholder="Image alt text"
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleUpdateImage(img.id, 'caption', e.currentTarget.textContent || '')}
                          className="text-sm text-muted-foreground outline-none focus:ring-2 focus:ring-primary rounded px-2 -mx-2"
                          style={{ minHeight: '1.5rem' }}
                        >
                          {img.caption || 'Enter caption (optional)...'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e)}
                    className="hidden"
                    id={`image-upload-${section.id}`}
                  />
                  <label
                    htmlFor={`image-upload-${section.id}`}
                    className="cursor-pointer text-sm text-muted-foreground"
                  >
                    {images.length === 0 ? 'Click to upload image' : '+ Add another image'}
                  </label>
                </div>
              </div>
            ) : images.length > 0 ? (
              <div className="space-y-4">
                {images.map((img: any) => (
                  <div key={img.id} className="space-y-2">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={img.imageUrl}
                        alt={img.alt}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    {img.caption && (
                      <p className="text-sm text-muted-foreground text-center">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
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
        const textImageLocalContent = localContent as typeof textImageContent
        const currentTextImageUrl = textImageLocalContent?.imageUrl || textImageContent.imageUrl
        const isVertical = textImageContent.imagePosition === 'top' || textImageContent.imagePosition === 'bottom'
        const imageFirst = textImageContent.imagePosition === 'top' || textImageContent.imagePosition === 'left'

        return (
          <div className={`${maxWidthClass}`}>
            <div className={isVertical ? 'space-y-4' : 'flex gap-6 items-start'}>
              {imageFirst && (
                <div className={isVertical ? 'w-full' : 'w-1/2'}>
                  {isEditing ? (
                    <>
                      {currentTextImageUrl ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                          <Image
                            src={currentTextImageUrl}
                            alt={textImageContent.alt || 'Uploaded image'}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                          <div className="absolute top-2 right-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id={`text-image-replace-left-${section.id}`}
                            />
                            <label
                              htmlFor={`text-image-replace-left-${section.id}`}
                              className="px-2 py-1 bg-background/80 border rounded text-xs cursor-pointer hover:bg-background"
                            >
                              Replace
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id={`text-image-upload-${section.id}`}
                          />
                          <label
                            htmlFor={`text-image-upload-${section.id}`}
                            className="cursor-pointer text-sm text-muted-foreground"
                          >
                            Click to upload image
                          </label>
                        </div>
                      )}
                      <input
                        type="text"
                        value={textImageContent.alt}
                        onChange={(e) => handleContentChange('alt', e.target.value)}
                        placeholder="Image alt text"
                        className="w-full mt-2 px-2 py-1 text-sm border rounded"
                      />
                    </>
                  ) : (
                    textImageContent.imageUrl && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={textImageContent.imageUrl}
                          alt={textImageContent.alt}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )
                  )}
                </div>
              )}

              <div className={isVertical ? 'w-full' : 'w-1/2'}>
                {isEditing ? (
                  <>
                    <div
                      ref={headerRef}
                      contentEditable
                      suppressContentEditableWarning
                  onFocus={(e) => {
                    const currentText = (localContent as any).header || ''
                    if (!currentText && e.currentTarget.textContent?.includes('Enter header')) {
                      e.currentTarget.textContent = ''
                    }
                  }}
                      onKeyDown={handleKeyDown}
                      onInput={(e) => {
                        const text = e.currentTarget.textContent || ''
                        if (text !== textImageContent.header) {
                          handleContentChange('header', text)
                        }
                      }}
                      onBlur={(e) => {
                        const text = e.currentTarget.textContent?.trim() || ''
                        handleContentChange('header', text)
                        if (!text) {
                          e.currentTarget.textContent = 'Enter header...'
                          e.currentTarget.classList.add('text-muted-foreground/50')
                        } else {
                          e.currentTarget.classList.remove('text-muted-foreground/50')
                        }
                      }}
                      className={`text-2xl font-semibold mb-4 outline-none focus:ring-2 focus:ring-primary rounded px-2 -mx-2 cursor-text ${!(localContent as any).header ? 'text-muted-foreground/50' : ''}`}
                      style={{ minHeight: '1.5rem' }}
                    >
                      {(localContent as any).header || 'Enter header...'}
                    </div>
                    <div
                      ref={bodyRef}
                      contentEditable
                      suppressContentEditableWarning
                  onFocus={(e) => {
                    const currentText = (localContent as any).body || ''
                    if (!currentText && e.currentTarget.textContent?.includes('Enter body')) {
                      e.currentTarget.textContent = ''
                    }
                  }}
                      onInput={(e) => {
                        const element = e.currentTarget
                        const cursorPos = saveCursorPosition(element)
                        const text = element.textContent || ''
                        const currentText = (localContent as any).body || ''
                        
                        if (text !== currentText) {
                          const updated = { ...localContent, body: text }
                          setLocalContent(updated)
                          onUpdate({ content: updated as any })
                          
                          setTimeout(() => {
                            if (cursorPos !== null && cursorPos !== undefined) {
                              restoreCursorPosition(element, cursorPos)
                            }
                          }, 0)
                        }
                      }}
                      onBlur={(e) => {
                        const text = e.currentTarget.textContent?.trim() || ''
                        handleContentChange('body', text)
                        if (!text) {
                          e.currentTarget.textContent = 'Enter body text...'
                          e.currentTarget.classList.add('text-muted-foreground/50')
                        } else {
                          e.currentTarget.classList.remove('text-muted-foreground/50')
                        }
                      }}
                      className={`text-base leading-relaxed text-muted-foreground outline-none focus:ring-2 focus:ring-primary rounded px-2 -mx-2 cursor-text ${!(localContent as any).body ? 'text-muted-foreground/50' : ''}`}
                      style={{ minHeight: '2rem' }}
                    >
                      {(localContent as any).body || 'Enter body text...'}
                    </div>
                  </>
                ) : (
                  <>
                    {textImageContent.header && (
                      <h2 className="text-2xl font-semibold mb-4">{textImageContent.header}</h2>
                    )}
                    {textImageContent.body && (
                      <p className="text-base leading-relaxed text-muted-foreground">{textImageContent.body}</p>
                    )}
                  </>
                )}
              </div>

              {!imageFirst && (
                <div className={isVertical ? 'w-full' : 'w-1/2'}>
                  {isEditing ? (
                    <>
                      {currentTextImageUrl ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                          <Image
                            src={currentTextImageUrl}
                            alt={textImageContent.alt || 'Uploaded image'}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                          <div className="absolute top-2 right-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id={`text-image-replace-right-${section.id}`}
                            />
                            <label
                              htmlFor={`text-image-replace-right-${section.id}`}
                              className="px-2 py-1 bg-background/80 border rounded text-xs cursor-pointer hover:bg-background"
                            >
                              Replace
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id={`text-image-upload-right-${section.id}`}
                          />
                          <label
                            htmlFor={`text-image-upload-right-${section.id}`}
                            className="cursor-pointer text-sm text-muted-foreground"
                          >
                            Click to upload image
                          </label>
                        </div>
                      )}
                      <input
                        type="text"
                        value={textImageLocalContent?.alt || textImageContent.alt}
                        onChange={(e) => handleContentChange('alt', e.target.value)}
                        placeholder="Image alt text"
                        className="w-full mt-2 px-2 py-1 text-sm border rounded"
                      />
                    </>
                  ) : (
                    currentTextImageUrl && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={currentTextImageUrl}
                          alt={textImageContent.alt}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isEmpty = () => {
    if (section.type === 'text') {
      const textContent = section.content as { header: string; body: string }
      return !textContent.header && !textContent.body
    }
    if (section.type === 'image') {
      const imageContent = section.content as { images: Array<{ id: string; imageUrl: string; alt: string; caption?: string }> }
      const images = imageContent.images || []
      return images.length === 0
    }
    if (section.type === 'text-image') {
      const textImageContent = section.content as { header: string; body: string; imageUrl: string }
      return !textImageContent.header && !textImageContent.body && !textImageContent.imageUrl
    }
    return false
  }

  // Don't render empty image sections in read-only mode
  if (!isEditing && section.type === 'image') {
    const imageContent = section.content as { images: Array<{ id: string; imageUrl: string; alt: string; caption?: string }> }
    const images = imageContent.images || []
    if (images.length === 0) {
      return null
    }
  }

  return (
    <div
      onClick={(e) => {
        // Don't select if clicking on contenteditable
        if ((e.target as HTMLElement).contentEditable !== 'true') {
          onSelect()
        }
      }}
      className={`
        relative p-4 rounded-lg transition-all
        ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}
        ${isEditing ? 'cursor-text' : 'cursor-pointer'}
        ${isEmpty() ? 'border-2 border-dashed border-muted-foreground/30' : ''}
      `}
    >
      {isEditing && (isSelected || isEmpty()) && (
        <div className="absolute -right-12 top-4 flex flex-col gap-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="p-1.5 bg-background border rounded shadow-sm hover:bg-muted transition-colors"
            title="Duplicate Section"
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M4 2V1C4 0.447715 4.44772 0 5 0H9C9.55228 0 10 0.447715 10 1V5C10 5.55228 9.55228 6 9 6H8M4 2H1C0.447715 2 0 2.44772 0 3V9C0 9.55228 0.447715 10 1 10H7C7.55228 10 8 9.55228 8 9V6M4 2H5C5.55228 2 6 2.44772 6 3V4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1.5 bg-background border rounded shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
            title="Delete Section"
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2 3H10M4.5 5.5V8.5M7.5 5.5V8.5M3 3L3.5 9.5C3.5 10.0523 3.94772 10.5 4.5 10.5H7.5C8.05228 10.5 8.5 10.0523 8.5 9.5L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
      {renderSection()}
    </div>
  )
}

