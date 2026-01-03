import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

export interface DraftData {
  recipient: string
  subject: string
  // message: string
  attachments: File[]
  walrusBlobId: string
}

interface DraftContextType {
  // Draft content
  draftData: DraftData | null
  setDraftData: (data: DraftData | null) => void

  // Auto-save state
  lastSavedAt: Date | null
  setLastSavedAt: (date: Date | null) => void

  // Save status
  isSaving: boolean
  setIsSaving: (saving: boolean) => void

  // Save error
  saveError: string | null
  setSaveError: (error: string | null) => void

  // Has unsaved changes
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (hasChanges: boolean) => void

  // Draft ID (when editing existing draft)
  currentDraftId: string | null
  setCurrentDraftId: (id: string | null) => void

  // Clear all draft state
  clearDraftState: () => void
}

const DraftContext = createContext<DraftContextType | undefined>(undefined)

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draftData, setDraftData] = useState<DraftData | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)

  const clearDraftState = useCallback(() => {
    setDraftData(null)
    setLastSavedAt(null)
    setIsSaving(false)
    setSaveError(null)
    setHasUnsavedChanges(false)
    setCurrentDraftId(null)
  }, [])

  const value: DraftContextType = {
    draftData,
    setDraftData,
    lastSavedAt,
    setLastSavedAt,
    isSaving,
    setIsSaving,
    saveError,
    setSaveError,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    currentDraftId,
    setCurrentDraftId,
    clearDraftState,
  }

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
}

export function useDraftContext() {
  const context = useContext(DraftContext)
  if (context === undefined) {
    throw new Error('useDraftContext must be used within DraftProvider')
  }
  return context
}
