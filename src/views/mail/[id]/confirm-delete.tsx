import { Button } from '@/components/ui/button'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
  emailSubject?: string
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose()
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
          <p className="text-foreground mb-2">
            Are you sure you want to delete this email?
          </p>
          {/* {emailSubject && (
            <div className="p-3 surface-dark rounded-lg border border-border mt-3">
              <p className="text-sm text-muted-foreground mb-1">Subject:</p>
              <p className="text-sm font-medium text-foreground truncate">
                {emailSubject}
              </p>
            </div>
          )} */}
          <p className="text-sm text-muted-foreground mt-4">
            This action cannot be undone. The email will be permanently removed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-border surface-dark">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {isDeleting ? (
              <>
                <span className="mr-2">Deleting...</span>
                <span className="inline-block animate-spin">⏳</span>
              </>
            ) : (
              'Delete Email'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
