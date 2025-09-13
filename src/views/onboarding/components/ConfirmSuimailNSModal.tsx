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
import { AlertCircle, Mail } from 'lucide-react'

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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Your SuimailNS</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="pt-2 space-y-4">
              <div>You are about to register your suimail namespace:</div>
              <div className="flex items-center justify-center bg-muted/50 p-3 rounded-md">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <span className="font-medium">{suimailNs}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Important:</div>
                    <div className="text-sm mt-1">
                      Once registered, your suimail namespace{' '}
                      <strong>cannot be changed</strong> due to the
                      decentralized nature of the Sui blockchain.
                    </div>
                  </div>
                </div>
              </div>
              <div>Are you sure you want to continue?</div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleOnConfirmSubmit}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Yes, I'm Sure
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
