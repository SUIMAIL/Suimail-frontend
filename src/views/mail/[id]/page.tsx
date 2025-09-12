import { useState, useEffect, useMemo } from 'react'
import type { IEmail } from '@/types/generic'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Trash2,
  Reply,
  Loader2,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Star,
  Archive,
  Forward,
} from 'lucide-react'
import { Loading } from '@/components/Loading'
import { Button } from '@/components/ui/button'
import {
  usePostDeleteMailMutation,
  usePostSendMailMutation,
} from '@/hooks/mail'
import { useFetchMailBodyQuery } from '@/hooks/mail'
import { useSuiClientQuery } from '@mysten/dapp-kit'
import MailNotFound from '@/components/MailNotFound'
import { SimpleAvatar } from '@/components/ui/SimpleAvatar'
import { useClaimEscrowTx } from '../../../hooks/ptb/claim-escrow-tx'
import { useToastContext } from '@/components/ui/toast'
import { useQueryClient } from '@tanstack/react-query'
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Tooltip } from '@/components/ui/tooltip'
import { ReplyComposer } from '@/views/mail/[id]/reply'
import RenderAttachments from './components/RenderAttachments'
import { EmailBodyFormatter } from './email-format'

const QuotedMessage = ({
  email,
  isExpanded,
  onToggle,
}: {
  email: IEmail
  isExpanded: boolean
  onToggle: () => void
}) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-4 bg-gray-50">
      {/* Collapsed header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>
          <SimpleAvatar
            initials={email.sender.suimailNs?.[0]?.toUpperCase() || '?'}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 truncate">
                {email.sender.suimailNs}
              </span>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {/* Inline quotedFormatDate to avoid TS error */}
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
              <div className="text-xs text-gray-500 truncate mt-1">
                {/* Strip HTML tags for preview */}
                {email.body.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Button
            size="icon"
            variant="ghost"
            className="p-1 h-6 w-6 rounded-full hover:bg-gray-200"
            onClick={e => {
              e.stopPropagation()
              // Handle star action
            }}
          >
            <Star className="h-3 w-3 text-gray-400" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="p-1 h-6 w-6 rounded-full hover:bg-gray-200"
            onClick={e => {
              e.stopPropagation()
              // Handle more options
            }}
          >
            <MoreVertical className="h-3 w-3 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white">
          {/* Full email header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <SimpleAvatar
                  initials={email.sender.suimailNs?.[0]?.toUpperCase() || '?'}
                  size="md"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {email.sender.suimailNs}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
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
                      className="p-2 h-8 w-8 rounded-full hover:bg-gray-200"
                    >
                      <Star className="h-4 w-4 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to starred</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="p-2 h-8 w-8 rounded-full hover:bg-gray-200"
                    >
                      <Reply className="h-4 w-4 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reply</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="p-2 h-8 w-8 rounded-full hover:bg-gray-200"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
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
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col bg-white border-l border-gray-200 shadow-sm z-20 overflow-hidden">
        {/* Enhanced Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center min-w-0 flex-1">
              <Button
                variant="ghost"
                className="mr-3 p-2 hover:bg-gray-100 transition-colors flex-shrink-0"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Button>
              <h1 className="text-xl font-medium text-gray-900 truncate">
                {latestMail.subject}
              </h1>
              {thread.length > 1 && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full flex-shrink-0">
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
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Archive className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={handleDeleteMail}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-gray-500" />
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
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={handleReply}
                    disabled={isReplying}
                  >
                    <Reply className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Forward className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forward</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More actions</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Sui-specific action buttons */}
          {latestMail.digest && (
            <div className="flex items-center px-4 pb-3 space-x-2">
              <button
                onClick={handleClaimSui}
                className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Claim Airdrop
              </button>
              <div className="text-xs text-gray-500">
                Transaction: {latestMail.digest.substring(0, 12)}...
              </div>
            </div>
          )}
        </div>

        {/* Email Content Area - Remove fixed height, use flex-1 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Quoted/Previous Messages */}
            {quotedMessages.length > 0 && (
              <div className="p-6 space-y-3">
                {quotedMessages.reverse().map(email => (
                  <QuotedMessage
                    key={email.id}
                    email={email}
                    isExpanded={expandedQuotes.has(email.id)}
                    onToggle={() => toggleQuotedMessage(email.id)}
                  />
                ))}
              </div>
            )}

            {/* Latest/Current Message */}
            {latestMail && (
              <div className="border-b border-gray-100 bg-white">
                {/* Message Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <SimpleAvatar
                        initials={
                          latestMail.sender.suimailNs?.[0]?.toUpperCase() || '?'
                        }
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h2 className="text-lg font-semibold text-gray-900">
                            {latestMail.sender.suimailNs}
                          </h2>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Verified
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
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
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">
                              Via Sui Blockchain
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
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Star className="h-5 w-5 text-gray-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Star this conversation</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={handleReply}
                            disabled={isReplying}
                          >
                            <Reply className="h-5 w-5 text-gray-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reply</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="h-5 w-5 text-gray-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>More options</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="px-6 pb-6">
                  <EmailBodyFormatter body={latestMail.body} />

                  {/* Attachments */}
                  {latestMail.attachments &&
                    latestMail.attachments.length > 0 && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-3">
                          {latestMail.attachments.length} attachment
                          {latestMail.attachments.length > 1 ? 's' : ''}
                        </div>
                        <RenderAttachments
                          attachments={latestMail.attachments}
                        />
                      </div>
                    )}

                  {/* Blockchain info */}
                  {latestMail.digest && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium text-blue-900 mb-1">
                            Blockchain Verified
                          </div>
                          <div className="text-blue-700">
                            Transaction:{' '}
                            <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                              {latestMail.digest}
                            </code>
                          </div>
                        </div>
                        <Button
                          onClick={handleClaimSui}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View on Explorer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reply Area - Move outside scrollable content and remove sticky positioning */}
        {!isReplying && (
          <div className="bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex items-center space-x-4">
                <SimpleAvatar initials="ME" size="sm" />
                <div
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
                  onClick={handleQuickReply}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">
                      Click here to reply to {latestMail.sender.suimailNs}...
                    </span>
                    <Reply className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={handleReply}
                      >
                        <Reply className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reply</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Forward className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Forward</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        )}

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
