import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DecryptionErrorViewProps {
  error: string
  onRetry: () => void
  onGoBack: () => void
}

export function DecryptionErrorView({
  error,
  onRetry,
  onGoBack,
}: DecryptionErrorViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center surface-base">
      <div className="max-w-md p-6 surface-light rounded-lg border border-destructive/20 elevation-1">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <Lock className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Decryption Failed
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
            <Button onClick={onGoBack} variant="outline" className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
