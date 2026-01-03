import { useMemo } from 'react'
import { Check, AlertCircle, Clock } from 'lucide-react'
import { useDraftContext } from '@/utils/contexts/DraftContext'

interface DraftAutoSaveIndicatorProps {
  lastSavedAt?: Date | null
}

export function DraftAutoSaveIndicator({
  lastSavedAt: propLastSavedAt,
}: DraftAutoSaveIndicatorProps = {}) {
  const {
    isSaving,
    lastSavedAt: contextLastSavedAt,
    saveError,
  } = useDraftContext()

  // Use prop if provided, otherwise fall back to context
  const lastSavedAt = propLastSavedAt ?? contextLastSavedAt

  const formattedTime = useMemo(() => {
    if (!lastSavedAt) return null
    const hours = lastSavedAt.getHours().toString().padStart(2, '0')
    const minutes = lastSavedAt.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }, [lastSavedAt])

  if (saveError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>{saveError}</span>
      </div>
    )
  }

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>Saving...</span>
      </div>
    )
  }

  if (lastSavedAt && formattedTime) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
        <span>Saved at {formattedTime}</span>
      </div>
    )
  }

  return null
}
