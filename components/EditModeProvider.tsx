'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import AddSectionButton from '@/components/editable/AddSectionButton'

interface EditModeContextType {
  editMode: boolean
  setEditMode: (enabled: boolean) => void
  authenticated: boolean
  slug?: string
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined)

export function useEditMode() {
  const context = useContext(EditModeContext)
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider')
  }
  return context
}

interface EditModeProviderProps {
  children: ReactNode
  slug?: string
}

export default function EditModeProvider({ children, slug }: EditModeProviderProps) {
  const [editMode, setEditMode] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth')
      const data = await response.json()
      setAuthenticated(data.authenticated)
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  return (
    <EditModeContext.Provider value={{ 
      editMode, 
      setEditMode, 
      authenticated,
      slug
    }}>
      {children}
      {authenticated && (
        <div className="fixed top-6 right-6 z-40 flex items-center gap-4 p-4">
          {editMode && slug && (
            <AddSectionButton slug={slug} />
          )}
          <Button
            onClick={() => setEditMode(!editMode)}
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            className="shadow-lg px-6 py-3"
          >
            {editMode ? '✕ Exit Edit' : '✏️ Edit Page'}
          </Button>
        </div>
      )}
    </EditModeContext.Provider>
  )
}
