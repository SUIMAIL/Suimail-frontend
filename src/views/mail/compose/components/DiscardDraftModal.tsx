import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'

interface DiscardDraftModalProps {
  isOpen: boolean
  onDiscard: () => void
  onCancel: () => void
  isDeletingDraft?: boolean
}

export function DiscardDraftModal({
  isOpen,
  onDiscard,
  onCancel,
  isDeletingDraft = false,
}: DiscardDraftModalProps) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={newOpen => {
        if (!newOpen) {
          onCancel()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertDialogTitle>Discard Draft?</AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription>
          You have unsaved changes. Are you sure you want to discard this draft?
          This action cannot be undone.
        </AlertDialogDescription>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel onClick={onCancel} disabled={isDeletingDraft}>
            Keep Draft
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscard}
            disabled={isDeletingDraft}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingDraft ? 'Discarding...' : 'Discard Draft'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
