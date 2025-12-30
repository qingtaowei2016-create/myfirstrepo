'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import ContentEditor from '@/components/ContentEditor'

interface ImageMetadata {
  url: string
  order: number
  filename: string
}

interface CaseStudyImages {
  overview: ImageMetadata[]
  research: ImageMetadata[]
  design: ImageMetadata[]
  results: ImageMetadata[]
}

interface AdminPanelProps {
  slug: string
}

export default function AdminPanel({ slug }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<'overview' | 'research' | 'design' | 'results'>('overview')
  const [images, setImages] = useState<CaseStudyImages>({
    overview: [],
    research: [],
    design: [],
    results: []
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'images' | 'content'>('content')

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
    loadImages()
  }, [slug])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth')
      const data = await response.json()
      setAuthenticated(data.authenticated)
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (data.success) {
        setAuthenticated(true)
        setPassword('')
        setIsOpen(true)
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch (error) {
      setError('Failed to authenticate')
    } finally {
      setLoading(false)
    }
  }

  const loadImages = async () => {
    try {
      const response = await fetch(`/api/admin/images?slug=${slug}`)
      const data = await response.json()
      setImages(data)
    } catch (error) {
      console.error('Failed to load images:', error)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      const file = files[0]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slug', slug)
      formData.append('section', selectedSection)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        await loadImages()
      } else {
        setError(data.error || 'Failed to upload image')
      }
    } catch (error) {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch('/api/admin/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, section: selectedSection, filename })
      })

      const data = await response.json()

      if (data.success) {
        await loadImages()
      } else {
        setError(data.error || 'Failed to delete image')
      }
    } catch (error) {
      setError('Failed to delete image')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (authenticated && e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && panelRef.current) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        
        // Constrain to viewport
        const maxX = window.innerWidth - panelRef.current.offsetWidth
        const maxY = window.innerHeight - panelRef.current.offsetHeight
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const currentImages = images[selectedSection] || []

  if (!authenticated && !isOpen) {
    return (
      <div 
        className="fixed bottom-6 right-6 z-50"
        style={position.x || position.y ? { left: `${position.x}px`, top: `${position.y}px`, bottom: 'auto', right: 'auto' } : {}}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg cursor-move"
          size="lg"
          onMouseDown={handleMouseDown}
        >
          Admin
        </Button>
      </div>
    )
  }

  // Content Editor mode - fullscreen
  const currentTab = activeTab // Store before type narrowing
  if (authenticated && isOpen && currentTab === 'content') {
    return (
      <div 
        ref={panelRef}
        className="fixed inset-0 z-50 bg-background"
        style={
          position.x || position.y
            ? { left: `${position.x}px`, top: `${position.y}px`, width: '100vw', height: '100vh' }
            : {}
        }
      >
        <Card className="h-full rounded-none shadow-lg border-2 flex flex-col">
          <CardHeader 
            className="pb-3 cursor-move select-none border-b"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Admin Panel</CardTitle>
                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={activeTab === 'images' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('images')}
                    className="h-7 px-3 text-xs"
                  >
                    Images
                  </Button>
                  <Button
                    variant={activeTab === 'content' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('content')}
                    className="h-7 px-3 text-xs"
                  >
                    Content Editor
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-8 w-8"
                onMouseDown={(e) => e.stopPropagation()}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ContentEditor slug={slug} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div 
      ref={panelRef}
      className="fixed z-50 w-96 max-w-[calc(100vw-3rem)]"
      style={
        position.x || position.y
          ? { left: `${position.x}px`, top: `${position.y}px` }
          : { bottom: '1.5rem', right: '1.5rem' }
      }
    >
      <Card className="rounded-3xl shadow-lg border-2">
        <CardHeader 
          className="pb-3 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Admin Panel</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="h-8 w-8"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {isOpen ? '−' : '+'}
            </Button>
          </div>
        </CardHeader>

        {isOpen && (
          <CardContent className="space-y-4">
            {!authenticated ? (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Authenticating...' : 'Login'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={activeTab === 'images' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('images')}
                    className="flex-1 h-8 text-xs"
                  >
                    Images
                  </Button>
                  <Button
                    variant={activeTab === 'content' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('content')}
                    className="flex-1 h-8 text-xs"
                  >
                    Content Editor
                  </Button>
                </div>

                {activeTab === 'images' ? (
                  <>
                    {/* Section Selector */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Section
                      </label>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value as typeof selectedSection)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="overview">Overview</option>
                        <option value="research">Research & Discovery</option>
                        <option value="design">Design Process</option>
                        <option value="results">Results & Impact</option>
                      </select>
                    </div>

                    {/* Upload Area */}
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
                          ? 'border-primary bg-primary/5'
                          : 'border-muted-foreground/25'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop an image here, or
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>

                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}

                    {/* Image List */}
                    {currentImages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Images ({currentImages.length})
                        </p>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {currentImages
                            .sort((a, b) => a.order - b.order)
                            .map((image) => (
                              <div
                                key={image.filename}
                                className="relative group border rounded-lg overflow-hidden"
                              >
                                <div className="relative aspect-video">
                                  <Image
                                    src={image.url}
                                    alt={image.filename}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleDelete(image.filename)}
                                >
                                  Delete
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[600px] overflow-hidden flex flex-col">
                    <div className="flex-1 min-h-0">
                      <ContentEditor slug={slug} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

