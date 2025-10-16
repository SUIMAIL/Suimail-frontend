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

              {/* Email Address Display */}
              <div className="flex items-center justify-center surface-dark elevation-1 p-4 rounded-lg border border-border">
                <Mail className="h-5 w-5 text-blue-base mr-2" />
                <span className="font-semibold text-foreground text-lg">
                  {suimailNs}
                </span>
              </div>

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
