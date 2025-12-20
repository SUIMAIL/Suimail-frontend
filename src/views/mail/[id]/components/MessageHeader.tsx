import { User, Reply, MoreVertical, ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useGetUserProfileImageQuery } from '@/hooks/user'
import { useToastContext } from '@/components/ui/toast'
import { httpService } from '@/api'
import type { IEmail } from '@/types/generic'

interface MessageHeaderProps {
  email: IEmail
  showReplyButton?: boolean
  onReply?: () => void
}

export function MessageHeader({
  email,
  showReplyButton = true,
  onReply,
}: MessageHeaderProps) {
  const [isLoadingBlobId, setIsLoadingBlobId] = useState(false)
  const { data: profileImageData, isPending: isLoadingProfileImage } =
    useGetUserProfileImageQuery()
  const { setNotification } = useToastContext()
  const profileImage = profileImageData?.imageUrl

  const handleViewTransaction = async () => {
    if (!email.id) return

    setIsLoadingBlobId(true)
    try {
      const response = await httpService.get(`/mail/blobId/${email.id}`)
      if (response.blobId) {
        window.open(
          `https://walruscan.com/testnet/blob/${response.blobId}`,
          '_blank',
          'noopener,noreferrer'
        )
      } else {
        throw new Error('Blob ID not found')
      }
    } catch (error) {
      console.error('Failed to load blob ID:', error)

      setNotification({
        message: 'Failed to load transaction details',
        type: 'error',
      })
    } finally {
      setIsLoadingBlobId(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 pb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {isLoadingProfileImage ? (
            <Skeleton className="w-12 h-12 rounded-full" />
          ) : profileImage ? (
            <img
              src={profileImage}
              alt="User"
              className="w-12 h-12 rounded-full object-cover border-2 border-border shadow-sm"
            />
          ) : (
            <div className="flex items-center justify-center w-12 h-12 rounded-full surface-base border border-border">
              <User className="size-6 text-muted-foreground" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-lg font-semibold text-foreground">
                {email.sender.suimailNs}
              </h2>
              {/* latestMail.mail.senderId.suimailNs */}
              <span className="px-2 py-1 bg-blue-base/10 text-blue-base text-xs font-medium rounded-full border border-blue-base/20">
                Verified
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                <span className="font-medium">to</span> me
              </div>
              <div className="flex items-center space-x-4">
                <span>
                  {new Date(email.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-muted-foreground/50">•</span>
                <button
                  onClick={handleViewTransaction}
                  className="hover:text-blue-dark text-blue-base flex items-center flex-shrink-0 cursor-pointer transition-colors"
                >
                  {isLoadingBlobId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span>View on Walrus</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {showReplyButton && (
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-2 rounded-full hover:bg-blue-base/10 hover:text-blue-base transition-colors"
                  onClick={onReply}
                >
                  <Reply className="h-5 w-5" />
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
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>More options</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}
