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
import { Mail, AlertTriangle, Database } from 'lucide-react'

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
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Confirm Your SuimailNS
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="pt-2 space-y-4">
              <div className="text-gray-700">
                You are about to register your suimail namespace:
              </div>

              {/* Namespace Display */}
              <div className="flex items-center justify-center bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold text-blue-900 text-lg">
                  {suimailNs}
                </span>
              </div>

              {/* Testnet Warning - Most Important */}
              <div className="bg-orange-50  border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <div className="font-semibold text-orange-800 text-sm uppercase tracking-wide">
                      ⚠️ TESTNET WARNING
                    </div>
                    <div className="text-orange-700 text-sm leading-relaxed">
                      <strong>Do NOT store sensitive information.</strong> This
                      is a testnet environment and all data can be lost at any
                      time. Use only for testing purposes.
                    </div>
                  </div>
                </div>
              </div>

              {/* Permanent Registration Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Database className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-medium text-amber-800 text-sm">
                      Permanent Registration
                    </div>
                    <div className="text-amber-700 text-sm leading-relaxed">
                      Once registered, your suimail namespace{' '}
                      <strong>cannot be changed</strong> due to the
                      decentralized nature of the Sui blockchain.
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Question */}
              <div className="text-center pt-2">
                <p className="text-gray-700 font-medium">
                  Do you understand and wish to continue?
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleOnConfirmSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            I Understand, Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
