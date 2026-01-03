import { useState, useEffect } from 'react'
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Reply,
  User,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useGetUserProfileImageQuery } from '@/hooks/user'
import { useSuiClient } from '@mysten/dapp-kit'
import { useSessionKey } from '@/hooks/mail/use-session-key'
import { decryptMailContent } from '@/utils/decrypt-mail'
import type { IEmail } from '@/types/generic'
import type { DecryptedContent } from '../types'
import { EmailBodyFormatter } from '../email-format'
import RenderAttachments from './RenderAttachments'
import { SessionKey } from '@mysten/seal'
import type { SuiClient } from '@mysten/sui/client'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID

interface QuotedMessageProps {
  email: IEmail
  isExpanded: boolean
  onToggle: () => void
  sessionKey: SessionKey | null
  suiClient: SuiClient
  packageId: string
}

export function QuotedMessage({
  email,
  isExpanded,
  onToggle,
}: QuotedMessageProps) {
  const suiClient = useSuiClient()
  const { sessionKey } = useSessionKey(PACKAGE_ID)
  const { data: profileImageData, isPending: isLoadingProfileImage } =
    useGetUserProfileImageQuery()
  const profileImage = profileImageData?.imageUrl

  const [decryptedContent, setDecryptedContent] =
    useState<DecryptedContent | null>(null)
  const [isDecrypting, setIsDecrypting] = useState(false)

  useEffect(() => {
    if (
      !isExpanded ||
      !email.mailBlobId ||
      !sessionKey ||
      decryptedContent ||
      isDecrypting
    ) {
      return
    }

    const decrypt = async () => {
      setIsDecrypting(true)
      try {
        const decrypted = await decryptMailContent({
          mailBlobId: email.mailBlobId,
          mailObjectId: email.mailObjectId,
          sessionKey,
          suiClient,
          packageId: PACKAGE_ID,
        })
        setDecryptedContent(decrypted)
      } catch (error) {
        console.error('Failed to decrypt quoted message:', error)
      } finally {
        setIsDecrypting(false)
      }
    }

    decrypt()
  }, [
    isExpanded,
    email.mailBlobId,
    email.mailObjectId,
    sessionKey,
    decryptedContent,
    isDecrypting,
    suiClient,
  ])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7)
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getPreviewText = () => {
    if (isDecrypting) return null
    const text = decryptedContent?.message
    return text?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
  }

  const hasAttachments = email.attachments && email.attachments.length > 0
  const canDecryptAttachments = !!(email.mailObjectId && sessionKey)

  return (
    <div className="border border-border rounded-lg mb-4 surface-dark elevation-1">
      {/* Collapsed Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {isLoadingProfileImage ? (
            <Skeleton className="w-10 h-10 rounded-full" />
          ) : profileImage ? (
            <img
              src={profileImage}
              className="w-10 h-10 rounded-full object-cover border-2 border-border shadow-sm"
              alt="Profile"
            />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-full surface-base border border-border">
              <User className="size-6 text-muted-foreground" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground truncate">
                {email.sender?.suimailNs || 'Unknown'}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatDate(email.createdAt)}
              </span>
            </div>
            {!isExpanded && (
              <div className="text-xs text-muted-foreground truncate mt-1">
                {isDecrypting ? (
                  <span className="flex items-center">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Decrypting...
                  </span>
                ) : (
                  getPreviewText()
                )}
              </div>
            )}
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="p-1 h-6 w-6 rounded-full hover:bg-accent"
          onClick={e => e.stopPropagation()}
        >
          <MoreVertical className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border surface-light">
          <div className="p-4 border-b border-border surface-dark">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {isLoadingProfileImage ? (
                  <Skeleton className="w-10 h-10 rounded-full" />
                ) : profileImage ? (
                  <img
                    src={profileImage}
                    alt={email.sender?.suimailNs || 'User'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-border shadow-sm"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full surface-base border border-border">
                    <User className="size-6 text-muted-foreground" />
                  </div>
                )}

                <div>
                  <div className="font-medium text-foreground">
                    {email.sender?.suimailNs || 'Unknown'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div>to me</div>
                    <div className="mt-1">
                      {new Date(email.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="p-2 h-8 w-8 rounded-full hover:bg-accent"
                    >
                      <Reply className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reply</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="p-2 h-8 w-8 rounded-full hover:bg-accent"
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="p-4">
            {isDecrypting ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                <span className="text-muted-foreground">
                  Decrypting message...
                </span>
              </div>
            ) : decryptedContent ? (
              <EmailBodyFormatter
                body={decryptedContent.message}
                isQuoted={true}
              />
            ) : null}

            {hasAttachments && canDecryptAttachments && (
              <div className="mt-4">
                <RenderAttachments
                  attachments={email.attachments!}
                  mailObjectId={email.mailObjectId}
                  sessionKey={sessionKey!}
                  suiClient={suiClient}
                  packageId={PACKAGE_ID}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
