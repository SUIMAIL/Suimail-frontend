import { Button } from '@/components/ui/button'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onCancel?: () => void
  onClose?: () => void
  onConfirm: () => void
  isLoading?: boolean
  isDeletingDraft?: boolean
  isDeleting?: boolean
  emailSubject?: string
  title?: string
  description?: string
}

export function ConfirmDeleteModal({
  isOpen,
  onCancel,
  onClose,
  onConfirm,
  isLoading = false,
  isDeletingDraft = false,
  isDeleting = false,
  title = 'Delete Email?',
  description = 'This action cannot be undone. The email will be permanently removed.',
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  const handleClose = onCancel || onClose || (() => {})
  const isDeleting_ = isLoading || isDeletingDraft || isDeleting

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting_) {
      handleClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="surface-light border border-border rounded-lg shadow-xl max-w-md w-full mx-4 elevation-3">
        {/* Content */}
        <div className="p-6">
          <p className="text-foreground mb-2 font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-border surface-dark">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isDeleting_}
            className="hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting_}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {isDeleting_ ? (
              <>
                <span className="mr-2">Deleting....</span>
                <span className="inline-block animate-spin">⏳</span>
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
