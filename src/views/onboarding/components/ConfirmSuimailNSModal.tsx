import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Mail, Database } from 'lucide-react'

interface ConfirmSuimailNSModalProps {
  showConfirmDialog: boolean
  setShowConfirmDialog: (showConfirmDialog: boolean) => void
  suimailNs: string
  handleOnConfirmSubmit: () => void
}

export function ConfirmSuimailNSModal({
  showConfirmDialog,
  setShowConfirmDialog,
  suimailNs,
  handleOnConfirmSubmit,
}: ConfirmSuimailNSModalProps) {
  // Check if verified by looking for .sui in the address
  const isVerified = suimailNs.includes('.sui')

  // Ensure the full email address has @suimailapp
  const fullEmailAddress = suimailNs.includes('@suimailapp')
    ? suimailNs
    : `${suimailNs}@suimailapp`

  if (!showConfirmDialog) return null

  return (
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent className="surface-light border-border max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground text-xl">
            Confirm Your SuiMail Address
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="pt-2 space-y-4">
              <div className="text-muted-foreground">
                You are about to register your SuiMail address:
              </div>

              {/* Updated Email Address Display */}
              <div className="flex items-center justify-center surface-dark elevation-1 p-4 rounded-lg border border-border">
                <Mail className="h-5 w-5 text-blue-base mr-2 flex-shrink-0" />
                <span className="font-semibold text-foreground text-lg break-all">
                  {fullEmailAddress}
                </span>
              </div>

              {/* Verified Badge for SuiNS users */}
              {isVerified && (
                <div className="bg-blue-base/10 border border-blue-base/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 justify-center">
                    <svg
                      className="w-5 h-5 text-blue-base"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-blue-base">
                      Verified SuiNS Owner
                    </span>
                  </div>
                </div>
              )}

              {/* Test Environment Warning */}
              <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <div className="font-semibold text-destructive text-sm">
                      ⚠️ Test Environment Notice
                    </div>
                    <div className="text-xs text-destructive/90 space-y-1">
                      <p>
                        This is a <strong>test environment</strong>. All data
                        may be cleared at any time without notice.
                      </p>
                      <p className="font-medium">
                        🚫 Do NOT store sensitive or important information
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Warning */}
              <div className="bg-blue-base/10 border border-blue-base/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-blue-base flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-medium text-blue-base text-sm">
                      Blockchain Registry
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Once registered, your address{' '}
                      <strong className="text-foreground">
                        cannot be changed
                      </strong>{' '}
                      due to the decentralized nature of the Sui blockchain.
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Are you sure you want to continue with this address?
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border hover:bg-accent">
            Go Back
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleOnConfirmSubmit}
            className="bg-blue-base hover:bg-blue-dark text-white"
          >
            Yes, Register Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
