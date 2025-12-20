import { useState, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useSuiClient } from '@mysten/dapp-kit'
import { Loading } from '@/components/Loading'
import MailNotFound from '@/components/MailNotFound'
import { useToastContext } from '@/components/ui/toast'
import { useFetchMailBodyQuery, usePostDeleteMailMutation } from '@/hooks/mail'
import { useSessionKeyContext } from '@/utils/contexts/AppContext/SessionKeyContext'
import { useSecureEmailDecryption } from '@/hooks/mail/use-secure-email-cache'
import { EmailHeader } from './components/EmailHeader'
import { EmailContent } from './components/EmailContent'
import { ConfirmDeleteModal } from './confirm-delete'
import { DecryptionErrorView } from './components/DecryptionErrorView'
import { useEmailThread } from './components/hooks/useEmailThread'
import { useTransactionData } from './components/hooks/useTransactionData'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID

interface ParentMailData {
  mailObjectId: string
  sender: {
    suimailNs: string
    imageUrl?: string
  }
  subject: string
  messagePreview: string
}

export default function EmailViewPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const suiClient = useSuiClient()
  // const { suimailNs } = useAppContext()
  const { setNotification } = useToastContext()

  const { sessionKey, isCreating: isCreatingSession } = useSessionKeyContext()

  const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: mail, isFetching } = useFetchMailBodyQuery(id ?? '')

  // Mutations
  const { mutateAsync: deleteMail, isPending: isDeleting } =
    usePostDeleteMailMutation()

  // Custom hooks
  const { thread } = useEmailThread(mail)
  const { txDigest, firstCreatedObjectId } = useTransactionData(mail, thread)

  // Get the latest mail from thread
  const latestMail = useMemo(() => {
    const threadMail = thread.length > 0 ? thread[0] : mail

    let actualMail = threadMail?.mail || threadMail
    if (actualMail?.mail) {
      actualMail = actualMail.mail
    }

    return actualMail
  }, [thread, mail])

  const mailObjectId = latestMail?.mailObjectId
  const mailBlobId = latestMail?.mailBlobId

  // Decryption
  const {
    decryptedContent,
    isDecrypting,
    error: decryptionError,
    retry: resetDecryption,
    clearCache,
  } = useSecureEmailDecryption({
    mailObjectId,
    mailBlobId,
    sessionKey,
    suiClient,
    packageId: PACKAGE_ID,
    enabled: !!latestMail && !!sessionKey && !!mailBlobId && !!mailObjectId,
  })

  // Derived state
  const isInbox = useMemo(() => pathname.startsWith('/mail/inbox'), [pathname])
  const quotedMessages = useMemo(() => thread.slice(1), [thread])

  // Loading states
  if (isFetching) return <Loading message="Loading email..." />
  if (!mail) return <MailNotFound />
  if (isCreatingSession) return <Loading message="Setting up encryption..." />

  // Safety check - must come before using latestMail
  if (!latestMail) return <Loading message="Loading email..." />

  // Error states
  if (decryptionError && !decryptedContent) {
    return (
      <DecryptionErrorView
        error={decryptionError}
        onRetry={resetDecryption}
        onGoBack={() => navigate(-1)}
      />
    )
  }

  // Handlers
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

  const handleDeleteMail = async () => {
    try {
      await deleteMail({
        mailId: latestMail.id || latestMail._id,
        path: isInbox ? 'recipient' : 'sender',
      })

      clearCache(mailObjectId)

      await queryClient.invalidateQueries({
        predicate: query =>
          query.queryKey[0] === 'inbox-mails' ||
          query.queryKey[0] === 'outbox-mails' ||
          (query.queryKey[0] === 'mail-body' &&
            query.queryKey[1] === latestMail.id),
      })

      setShowDeleteModal(false)
      navigate(isInbox ? '/mail/inbox' : '/mail/sent')
    } catch {
      setNotification({
        message: 'Failed to delete mail',
        type: 'error',
      })
    }
  }

  const handleReply = () => {
    // Build parent mail data from current email
    const parentMailData: ParentMailData = {
      mailObjectId: latestMail.mailObjectId,
      sender: {
        suimailNs: latestMail.sender.suimailNs,
        imageUrl: latestMail.sender.imageUrl,
      },
      subject: decryptedContent?.subject || latestMail.subject || 'No subject',
      messagePreview: decryptedContent?.message
        ? decryptedContent.message.substring(0, 200)
        : 'Encrypted message...',
    }

    navigate('/mail/reply', {
      state: {
        parentMail: parentMailData,
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col surface-base">
      <div className="flex-1 flex flex-col surface-light border-l border-border elevation-1 z-20 overflow-hidden">
        {/* Header */}
        <EmailHeader
          email={latestMail}
          threadCount={thread.length}
          decryptedContent={decryptedContent}
          isDecrypting={isDecrypting}
          isDeleting={isDeleting}
          isReplying={false}
          txDigest={txDigest}
          firstCreatedObjectId={firstCreatedObjectId}
          onBack={() => navigate(-1)}
          onDelete={() => setShowDeleteModal(true)}
          onReply={handleReply}
        />

        {/* Email Content */}
        <EmailContent
          latestMail={latestMail}
          quotedMessages={quotedMessages}
          expandedQuotes={expandedQuotes}
          decryptedContent={decryptedContent}
          isDecrypting={isDecrypting}
          onToggleQuote={toggleQuotedMessage}
          sessionKey={sessionKey}
          suiClient={suiClient}
          packageId={PACKAGE_ID}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {latestMail && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteMail}
          isDeleting={isDeleting}
          emailSubject={decryptedContent?.subject || latestMail.subject}
        />
      )}
    </div>
  )
}
