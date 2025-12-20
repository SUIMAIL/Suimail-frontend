import {
  ArrowLeft,
  Trash2,
  Reply,
  Loader2,
  MoreVertical,
  Unlock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useClaimEscrowTx } from '@/hooks/ptb/claim-escrow-tx'
import type { IEmail } from '@/types/generic'
import type { DecryptedContent } from '../types'

interface EmailHeaderProps {
  email: IEmail
  threadCount: number
  decryptedContent: DecryptedContent | null
  isDecrypting: boolean
  isDeleting: boolean
  isReplying: boolean
  txDigest?: string
  firstCreatedObjectId?: string
  onBack: () => void
  onDelete: () => void
  onReply: () => void
}

export function EmailHeader({
  email,
  threadCount,
  decryptedContent,
  isDecrypting,
  isDeleting,
  isReplying,
  txDigest,
  firstCreatedObjectId,
  onBack,
  onDelete,
  onReply,
}: EmailHeaderProps) {
  const { claimEscrowTx } = useClaimEscrowTx()

  const handleClaimSui = () => {
    if (firstCreatedObjectId) {
      claimEscrowTx(firstCreatedObjectId)
    }
  }

  return (
    <div className="sticky top-0 z-10 surface-light border-b border-border elevation-2">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center min-w-0 flex-1">
          <Button
            variant="ghost"
            className="mr-3 p-2 hover:bg-accent transition-colors flex-shrink-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>

          <h1 className="text-xl font-semibold text-foreground truncate">
            {decryptedContent?.subject || email.subject}
          </h1>

          {threadCount > 1 && (
            <span className="ml-2 px-2 py-1 surface-dark text-xs text-muted-foreground rounded-full flex-shrink-0 border border-border">
              {threadCount} messages
            </span>
          )}

          {decryptedContent && (
            <span className="ml-2 px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded-full flex-shrink-0 border border-green-500/20 flex items-center">
              <Unlock className="h-3 w-3 mr-1" />
              Decrypted
            </span>
          )}

          {isDecrypting && (
            <span className="ml-2 px-2 py-1 bg-blue-500/10 text-blue-600 text-xs rounded-full flex-shrink-0 border border-blue-500/20 flex items-center">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Decrypting...
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="p-2 rounded-full hover:bg-blue-base/10 hover:text-blue-base transition-colors"
                onClick={onReply}
                disabled={isReplying}
              >
                <Reply className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="p-2 rounded-full hover:bg-accent transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>More actions</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {txDigest && (
        <div className="flex items-center px-4 pb-3 space-x-2">
          <button
            onClick={handleClaimSui}
            className="flex items-center px-4 py-2 rounded-lg bg-blue-base text-white text-sm font-medium hover:bg-blue-dark transition-all duration-200 elevation-2 hover:shadow-hover"
          >
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            Claim Airdrop
          </button>
          <div className="text-xs text-muted-foreground">
            Transaction: {txDigest.substring(0, 12)}...
          </div>
        </div>
      )}
    </div>
  )
}
