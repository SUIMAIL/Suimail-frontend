import { useState, useEffect, useMemo } from 'react'
import type { IEmail } from '@/types/generic'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useGetUserProfileImageQuery } from '@/hooks/user'
import { ConfirmDeleteModal } from '../[id]/confirm-delete'
import {
  ArrowLeft,
  Trash2,
  Reply,
  Loader2,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  User,
  ExternalLink,
} from 'lucide-react'
import { Loading } from '@/components/Loading'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  usePostDeleteMailMutation,
  usePostSendMailMutation,
} from '@/hooks/mail'
import { useFetchMailBodyQuery } from '@/hooks/mail'
import { useSuiClientQuery } from '@mysten/dapp-kit'
import MailNotFound from '@/components/MailNotFound'
import { useClaimEscrowTx } from '../../../hooks/ptb/claim-escrow-tx'
import { useToastContext } from '@/components/ui/toast'
import { useQueryClient } from '@tanstack/react-query'
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Tooltip } from '@/components/ui/tooltip'
import { ReplyComposer } from '@/views/mail/[id]/reply'
import RenderAttachments from './components/RenderAttachments'
import { EmailBodyFormatter } from './email-format'
import { httpService } from '@/api'

const QuotedMessage = ({
  email,
  isExpanded,
  onToggle,
  profileImage,
  isLoadingProfileImage,
}: {
  email: IEmail
  isExpanded: boolean
  onToggle: () => void
  profileImage?: string
  isLoadingProfileImage: boolean
}) => {
  return (
    <div className="border border-border rounded-lg mb-4 surface-dark elevation-1">
      {/* Collapsed header */}
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
              alt={email.sender.suimailNs || 'User'}
              className="w-10 h-10 rounded-full object-cover border-2 border-border shadow-sm"
            />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-full surface-base border border-border">
              <User className="size-6 text-muted-foreground" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground truncate">
                {email.sender.suimailNs}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {(() => {
                  const date = new Date(email.createdAt)
                  const now = new Date()
                  const diffTime = Math.abs(now.getTime() - date.getTime())
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  if (diffDays === 1) return 'Today'
                  if (diffDays === 2) return 'Yesterday'
                  if (diffDays <= 7)
                    return date.toLocaleDateString('en-US', {
                      weekday: 'short',
                    })
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                })()}
              </span>
            </div>
            {!isExpanded && (
              <div className="text-xs text-muted-foreground truncate mt-1">
                {email.body.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Button
            size="icon"
            variant="ghost"
            className="p-1 h-6 w-6 rounded-full hover:bg-accent"
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <MoreVertical className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border surface-light">
          {/* Full email header */}
          <div className="p-4 border-b border-border surface-dark">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {isLoadingProfileImage ? (
                  <Skeleton className="w-10 h-10 rounded-full" />
                ) : profileImage ? (
                  <img
                    src={profileImage}
                    alt={email.sender.suimailNs || 'User'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-border shadow-sm"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full surface-base border border-border">
                    <User className="size-6 text-muted-foreground" />
                  </div>
                )}

                <div>
                  <div className="font-medium text-foreground">
                    {email.sender.suimailNs}
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

          {/* Email content */}
          <div className="p-4">
            <EmailBodyFormatter body={email.body} isQuoted={true} />
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-4">
                <RenderAttachments attachments={email.attachments} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EmailViewPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const queryClient = useQueryClient()

  const { id } = useParams<{ id: string }>()
  const [txDigest, setTxDigest] = useState<string>('')
  const [isReplying, setIsReplying] = useState(false)
  const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set())
  const [isLoadingBlobId, setIsLoadingBlobId] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { claimEscrowTx } = useClaimEscrowTx()
  const { setNotification } = useToastContext()

  const { data: mail, isFetching } = useFetchMailBodyQuery(id ?? '')
  const [thread, setThread] = useState<IEmail[]>([])

  const { mutateAsync: deleteMail, isPending: isDeleting } =
    usePostDeleteMailMutation()

  const { mutateAsync: sendMail, isPending: isSending } =
    usePostSendMailMutation()

  const { data } = useSuiClientQuery('getTransactionBlock', {
    digest: txDigest,
    options: { showObjectChanges: true },
  })

  const isInbox = useMemo(() => pathname.startsWith('/mail/inbox'), [pathname])

  const firstCreatedObjectId = useMemo(
    () =>
      data?.objectChanges?.find(change => change.type === 'created')?.objectId,
    [data?.objectChanges]
  )

  const { data: profileImageData, isPending: isLoadingProfileImage } =
    useGetUserProfileImageQuery()
  const profileImage = useMemo(
    () => profileImageData?.imageUrl,
    [profileImageData]
  )

  // Build thread by following parentMailId
  useEffect(() => {
    async function buildThread(currentMail: IEmail | undefined) {
      if (!currentMail) return setThread([])
      const chain: IEmail[] = [currentMail]
      let parentId = currentMail.parentMailId
      while (parentId) {
        try {
          const parent = await fetchMail(parentId)
          if (!parent) break
          chain.push(parent)
          parentId = parent.parentMailId
        } catch {
          break
        }
      }
      setThread(chain)
    }
    buildThread(mail)
  }, [mail])

  // Helper to fetch a mail by id
  async function fetchMail(mailId: string): Promise<IEmail | null> {
    try {
      const res = await fetch(`/mail/${mailId}`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  const latestMail = thread.length > 0 ? thread[0] : mail
  const quotedMessages = thread.slice(1)

  useEffect(() => {
    if (latestMail?.digest) {
      setTxDigest(latestMail.digest)
    }
  }, [latestMail, firstCreatedObjectId])

  const toggleQuotedMessage = (emailId: string) => {
    setExpandedQuotes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(emailId)) {
        newSet.delete(emailId)
      } else {
        newSet.add(emailId)
      }
      return newSet
    })
  }

  // Fetch blob ID and open Walrus Scan
  const handleViewTransaction = async () => {
    if (!latestMail?.id) return

    setIsLoadingBlobId(true)
    try {
      console.log('Fetching blob ID for mail ID:', latestMail.id)
      const response = await httpService.get(`/mail/blobId/${latestMail.id}`)

      // if (!response.ok) {
      //   throw new Error('Failed to fetch blob ID')
      // }
      console.log('Blob ID response:', response.blobId)
      const data = response

      if (data.blobId) {
        // Open Walrus Scan in a new tab
        window.open(
          `https://walruscan.com/testnet/blob/${data.blobId}`,
          '_blank',
          'noopener,noreferrer'
        )
      } else {
        throw new Error('Blob ID not found')
      }
    } catch (error) {
      console.error('Error fetching blob ID:', error)
      setNotification({
        message: 'Failed to load transaction details',
        type: 'error',
      })
    } finally {
      setIsLoadingBlobId(false)
    }
  }

  if (isFetching) return <Loading message="Loading email..." />
  if (!mail) return <MailNotFound />

  const handleClaimSui = async () => {
    if (firstCreatedObjectId) {
      claimEscrowTx(firstCreatedObjectId)
    }
  }

  const handleDeleteMail = async () => {
    try {
      await deleteMail({
        mailId: latestMail?.id || '',
        path: isInbox ? 'recipient' : 'sender',
      }).then(async () => {
        await queryClient.invalidateQueries({
          predicate: query =>
            query.queryKey[0] === 'inbox-mails' ||
            query.queryKey[0] === 'outbox-mails' ||
            (query.queryKey[0] === 'mail-body' &&
              query.queryKey[1] === (latestMail?.id || '')),
        })
        setShowDeleteModal(false)
        navigate(isInbox ? '/mail/inbox' : '/mail/sent')
      })
    } catch {
      setNotification({
        message: 'Failed to delete mail',
        type: 'error',
      })
    }
  }

  const handleReply = () => {
    setIsReplying(true)
  }

  const handleSend = async (replyData: {
    to: string
    subject: string
    body: string
    inReplyTo?: string
    originalMessageId?: string
  }) => {
    try {
      const formData = new FormData()
      formData.append('recipient', replyData.to)
      formData.append('subject', replyData.subject)
      formData.append('body', replyData.body)
      if (replyData.inReplyTo) {
        formData.append('parentMailId', replyData.inReplyTo)
      }

      await sendMail(formData)

      await queryClient.invalidateQueries({
        predicate: query =>
          query.queryKey[0] === 'outbox-mails' ||
          query.queryKey[0] === 'inbox-mails',
      })

      setNotification({
        message: 'Reply sent successfully',
        type: 'success',
      })
      setIsReplying(false)
    } catch (error: unknown) {
      let msg = 'Failed to send reply'
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as any).message === 'string'
      ) {
        msg = (error as any).message
      }
      setNotification({
        message: msg,
        type: 'error',
      })
      throw error
    }
  }

  const handleCancelReply = () => {
    setIsReplying(false)
  }

  const handleQuickReply = () => {
    setIsReplying(true)
  }

  if (!latestMail) return null

  return (
    <div className="min-h-screen flex flex-col surface-base">
      <div className="flex-1 flex flex-col surface-light border-l border-border elevation-1 z-20 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 surface-light border-b border-border elevation-2">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center min-w-0 flex-1">
              <Button
                variant="ghost"
                className="mr-3 p-2 hover:bg-accent transition-colors flex-shrink-0"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground truncate">
                {latestMail.subject}
              </h1>
              {thread.length > 1 && (
                <span className="ml-2 px-2 py-1 surface-dark text-xs text-muted-foreground rounded-full flex-shrink-0 border border-border">
                  {thread.length} messages
                </span>
              )}
            </div>
            {/* Action buttons */}
            <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors touch-target"
                    // onClick={handleDeleteMail}
                    onClick={() => setShowDeleteModal(true)}
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
                    className="p-2 rounded-full hover:bg-blue-base/10 hover:text-blue-base transition-colors touch-target"
                    onClick={handleReply}
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
                    className="p-2 rounded-full hover:bg-accent transition-colors touch-target"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More actions</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Claim Airdrop Button */}
          {latestMail.digest && (
            <div className="flex items-center px-4 pb-3 space-x-2">
              <button
                onClick={handleClaimSui}
                className="flex items-center px-4 py-2 rounded-lg bg-blue-base text-white text-sm font-medium hover:bg-blue-dark transition-all duration-200 elevation-2 hover:shadow-hover touch-target"
              >
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Claim Airdrop
              </button>
              <div className="text-xs text-muted-foreground">
                Transaction: {latestMail.digest.substring(0, 12)}...
              </div>
            </div>
          )}
        </div>

        {/* Email Content Area */}
        <div className="flex-1 overflow-y-auto smooth-scroll">
          <div className="max-w-4xl mx-auto">
            {/* Quoted/Previous Messages */}
            {quotedMessages.length > 0 && (
              <div className="p-4 sm:p-6 space-y-3">
                {quotedMessages.reverse().map(email => (
                  <QuotedMessage
                    key={email.id}
                    email={email}
                    isExpanded={expandedQuotes.has(email.id)}
                    onToggle={() => toggleQuotedMessage(email.id)}
                    profileImage={profileImage}
                    isLoadingProfileImage={isLoadingProfileImage}
                  />
                ))}
              </div>
            )}

            {/* Latest/Current Message */}
            {latestMail && (
              <div className="border-b border-border surface-light">
                {/* Message Header */}
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
                            {latestMail.sender.suimailNs}
                          </h2>
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
                              {new Date(
                                latestMail.createdAt
                              ).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-muted-foreground/50">•</span>
                            <span
                              onClick={handleViewTransaction}
                              // disabled={isLoadingBlobId}
                              className=" hover:text-blue-dark text-blue-base flex items-center  flex-shrink-0 cursor-pointer transition-colors"
                            >
                              {isLoadingBlobId ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="h-4 w-4" />
                                  <span>View on Walrus</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="p-2 rounded-full hover:bg-blue-base/10 hover:text-blue-base transition-colors"
                            onClick={handleReply}
                            disabled={isReplying}
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
                  </div>
                </div>

                {/* Message Body */}
                <div className="px-4 sm:px-6 pb-6">
                  <EmailBodyFormatter body={latestMail.body} />

                  {/* Attachments */}
                  {latestMail.attachments &&
                    latestMail.attachments.length > 0 && (
                      <div className="mt-6 p-4 surface-dark rounded-lg border border-border elevation-1">
                        <div className="text-sm font-medium text-foreground mb-3">
                          {latestMail.attachments.length} attachment
                          {latestMail.attachments.length > 1 ? 's' : ''}
                        </div>
                        <RenderAttachments
                          attachments={latestMail.attachments}
                        />
                      </div>
                    )}

                  {/* Blockchain info with View Transaction button */}
                  {latestMail.digest && (
                    <div className="mt-6 p-4 bg-blue-base/10 rounded-lg border border-blue-base/20">
                      <div className="flex items-center justify-between">
                        <div className="text-sm flex-1 min-w-0 mr-4">
                          <div className="font-medium text-blue-base mb-1">
                            Blockchain Verified
                          </div>
                          <div className="text-muted-foreground">
                            Transaction:{' '}
                            <code className="surface-dark px-2 py-1 rounded text-xs break-all">
                              {latestMail.digest}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Reply Area */}
        {!isReplying && (
          <div className="surface-light border-t border-border elevation-2">
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex items-center space-x-4">
                {isLoadingProfileImage ? (
                  <Skeleton className="w-8 h-8 rounded-full" />
                ) : profileImage ? (
                  <img
                    src={profileImage}
                    alt="Me"
                    className="w-8 h-8 rounded-full object-cover border-2 border-border shadow-sm"
                  />
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full surface-base border border-border">
                    <User className="size-5 text-muted-foreground" />
                  </div>
                )}
                <div
                  className="flex-1 rounded-lg border border-border px-4 py-3 surface-base hover:bg-accent cursor-pointer transition-colors elevation-1 hover:elevation-2"
                  onClick={handleQuickReply}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Click here to reply to {latestMail.sender.suimailNs}...
                    </span>
                    <Reply className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteMail}
          isDeleting={isDeleting}
          emailSubject={latestMail?.subject}
        />

        {/* Reply Composer Overlay */}
        {latestMail && (
          <ReplyComposer
            originalEmail={latestMail}
            onSend={handleSend}
            onCancel={handleCancelReply}
            isVisible={isReplying}
            isSending={isSending}
          />
        )}
      </div>
    </div>
  )
}
