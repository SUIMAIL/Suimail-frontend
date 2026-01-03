import type { IEmail } from '@/types/generic'
import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { EmailTab } from './EmailTab'
import { EmailListToolbar } from './EmailListToolbar'
import { useEmailListContext } from './EmailListContext'
import { ConfirmDeleteModal } from '@/views/mail/[id]/confirm-delete'
import { useToastContext } from '../ui/toast'
import { sortEmailsByLatest } from '@/utils/helpers'
import mixpanel from '@/utils/mixpanel'

import {
  usePostDeleteMailsMutation,
  usePostMarkMailsAsReadMutation,
  useDeleteManyDraftsMutation,
} from '@/hooks/mail'

interface EmailListProps {
  mails: IEmail[]
  refetch?: () => void
  isDraftView?: boolean // Add this prop
}

export function EmailList({
  mails,
  refetch,
  isDraftView = false,
}: EmailListProps) {
  const safeMails = useMemo(() => {
    if (!mails || !Array.isArray(mails)) {
      return []
    }
    return mails
  }, [mails])

  const hasEmails = safeMails.length > 0
  const { pathname } = useLocation()

  const isInboxPage = useMemo(() => pathname === '/mail/inbox', [pathname])
  const isDraftsPage = useMemo(
    () => pathname === '/mail/drafts' || isDraftView,
    [pathname, isDraftView]
  )

  const queryClient = useQueryClient()
  const { setNotification } = useToastContext()

  const { hasSelectedEmails, selectedEmails, setSelectedEmails } =
    useEmailListContext()

  const { mutateAsync: markMailsAsRead, isPending: isMarkingMailsAsRead } =
    usePostMarkMailsAsReadMutation()

  const { mutateAsync: deleteMails, isPending: isDeletingMails } =
    usePostDeleteMailsMutation()

  const { mutateAsync: deleteDrafts, isPending: isDeletingDrafts } =
    useDeleteManyDraftsMutation()

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isDeleting = isDeletingMails || isDeletingDrafts

  const handleSelectEmail = (mail: IEmail) => {
    if (selectedEmails.includes(mail)) {
      setSelectedEmails(selectedEmails.filter(e => e.id !== mail.id))
    } else {
      setSelectedEmails([...selectedEmails, mail])
    }
  }

  const handleSelectAllEmails = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(safeMails)
    } else {
      setSelectedEmails([])
    }
  }

  const handleMarkSelectedEmailsAsRead = async () => {
    // Don't allow marking drafts as read
    if (isDraftsPage) {
      return
    }

    const mailIds = selectedEmails
      .filter(mail => !mail.readAt)
      .map(mail => mail.id)

    if (!mailIds.length) {
      setNotification({
        message: 'No mails to mark as read',
        type: 'error',
      })
      return
    }

    const message = `${mailIds.length} mail${
      mailIds.length > 1 ? 's' : ''
    } marked as read`

    try {
      await markMailsAsRead({
        mailIds,
      }).then(() => {
        mixpanel.track('Mark Mail As Read Success', {
          mail_ids: mailIds,
        })
        setNotification({
          message,
          type: 'success',
        })
        queryClient.invalidateQueries({
          queryKey: isInboxPage ? ['inbox-mails'] : ['outbox-mails'],
        })
      })
    } catch {
      mixpanel.track('Mark Mail As Read Failure', {
        mail_ids: mailIds,
        error_message: 'Failed to mark emails as read',
      })
      setNotification({
        message: 'Failed to mark emails as read',
        type: 'error',
      })
    }
  }

  const handleDeleteSelectedEmails = async () => {
    const mailIds = selectedEmails.map(mail => mail.id)

    if (!mailIds.length) {
      setNotification({
        message: isDraftsPage ? 'No drafts to delete' : 'No mails to delete',
        type: 'error',
      })
      return
    }

    const itemType = isDraftsPage ? 'draft' : 'mail'
    const message = `${mailIds.length} ${itemType}${
      mailIds.length > 1 ? 's' : ''
    } deleted`

    try {
      if (isDraftsPage) {
        // Delete drafts
        await deleteDrafts(mailIds).then(() => {
          mixpanel.track('Delete Draft Success', {
            draft_ids: mailIds,
          })
          setNotification({
            message,
            type: 'success',
          })
          setShowDeleteModal(false)
          queryClient.invalidateQueries({
            queryKey: ['drafts-mails'],
          })
        })
      } else {
        // Delete regular mails
        await deleteMails({
          mailIds,
          path: isInboxPage ? 'recipient' : 'sender',
        }).then(() => {
          mixpanel.track('Delete Mail Success', {
            mail_ids: mailIds,
            path: isInboxPage ? 'recipient' : 'sender',
          })
          setNotification({
            message,
            type: 'success',
          })
          setShowDeleteModal(false)
          queryClient.invalidateQueries({
            queryKey: isInboxPage ? ['inbox-mails'] : ['outbox-mails'],
          })
        })
      }
    } catch {
      mixpanel.track(
        isDraftsPage ? 'Delete Draft Failure' : 'Delete Mail Failure',
        {
          mail_ids: mailIds,
          error_message: isDraftsPage
            ? 'Failed to delete drafts'
            : 'Failed to delete mails',
        }
      )
      setNotification({
        message: isDraftsPage
          ? 'Failed to delete drafts'
          : 'Failed to delete mails',
        type: 'error',
      })
    }
  }

  const handleDeleteClick = () => {
    const mailIds = selectedEmails.map(mail => mail.id)

    if (!mailIds.length) {
      setNotification({
        message: isDraftsPage ? 'No drafts to delete' : 'No mails to delete',
        type: 'error',
      })
      return
    }
    setShowDeleteModal(true)
  }

  const sortedEmails = useMemo(() => {
    return sortEmailsByLatest(safeMails)
  }, [safeMails])

  return (
    <div className="flex flex-col rounded-lg border border-border surface-light elevation-1">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <EmailListToolbar
          refetch={refetch}
          hasSelectedEmails={hasSelectedEmails}
          handleSelectAllEmails={handleSelectAllEmails}
          handleMarkSelectedEmailsAsRead={handleMarkSelectedEmailsAsRead}
          handleDeleteSelectedEmails={handleDeleteClick}
          isDraftView={isDraftsPage} // Pass this to toolbar
        />

        <span className="text-sm text-muted-foreground">
          {safeMails.length}{' '}
          {isDraftsPage
            ? safeMails.length > 1
              ? 'drafts'
              : 'draft'
            : safeMails.length > 1
              ? 'mails'
              : 'mail'}
        </span>
      </div>

      <div className="grid grid-cols-1">
        {hasEmails ? (
          sortedEmails.map(mail => (
            <EmailTab
              key={mail.id}
              mail={mail}
              onSelect={handleSelectEmail}
              isSelected={selectedEmails.includes(mail)}
              isLoading={isMarkingMailsAsRead || isDeleting}
              isDraftView={isDraftsPage} // Pass this to tab
            />
          ))
        ) : (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {isDraftsPage ? 'No drafts found' : 'No mail found'}
            </p>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSelectedEmails}
        isDeleting={isDeleting}
        title={isDraftsPage ? 'Delete Drafts?' : undefined}
        description={
          isDraftsPage
            ? 'These drafts will be permanently deleted. This action cannot be undone.'
            : undefined
        }
      />
    </div>
  )
}
