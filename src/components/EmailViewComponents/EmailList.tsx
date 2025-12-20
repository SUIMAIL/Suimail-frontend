import type { IEmail } from '@/types/generic'
import { useState } from 'react'
import { EmailTab } from './EmailTab'
import { EmailListToolbar } from './EmailListToolbar'
import { useEmailListContext } from './EmailListContext'
import { ConfirmDeleteModal } from '@/views/mail/[id]/confirm-delete'

import {
  usePostDeleteMailsMutation,
  usePostMarkMailsAsReadMutation,
} from '@/hooks/mail'
import { useToastContext } from '../ui/toast'
import { useMemo } from 'react'
import { sortEmailsByLatest } from '@/utils/helpers'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import mixpanel from '@/utils/mixpanel'

interface EmailListProps {
  mails: IEmail[]
  refetch?: () => void
}

export function EmailList({ mails, refetch }: EmailListProps) {
  const safeMails = useMemo(() => {
    if (!mails || !Array.isArray(mails)) {
      return []
    }
    return mails
  }, [mails])

  const hasEmails = safeMails.length > 0
  const { pathname } = useLocation()

  const isInboxPage = useMemo(() => pathname === '/mail/inbox', [pathname])

  const queryClient = useQueryClient()
  const { setNotification } = useToastContext()

  const { hasSelectedEmails, selectedEmails, setSelectedEmails } =
    useEmailListContext()

  const { mutateAsync: markMailsAsRead, isPending: isMarkingMailsAsRead } =
    usePostMarkMailsAsReadMutation()

  const { mutateAsync: deleteMails, isPending: isDeletingMails } =
    usePostDeleteMailsMutation()

  const [showDeleteModal, setShowDeleteModal] = useState(false)

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
        message: 'No mails to delete',
        type: 'error',
      })
      return
    }

    const message = `${mailIds.length} mail${
      mailIds.length > 1 ? 's' : ''
    } deleted`

    try {
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
        setShowDeleteModal(false) // Close modal on success
        queryClient.invalidateQueries({
          queryKey: isInboxPage ? ['inbox-mails'] : ['outbox-mails'],
        })
      })
    } catch {
      mixpanel.track('Delete Mail Failure', {
        mail_ids: mailIds,
        path: isInboxPage ? 'recipient' : 'sender',
        error_message: 'Failed to delete mails',
      })
      setNotification({
        message: 'Failed to delete mails',
        type: 'error',
      })
    }
  }

  const handleDeleteClick = () => {
    const mailIds = selectedEmails.map(mail => mail.id)

    if (!mailIds.length) {
      setNotification({
        message: 'No mails to delete',
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
        />

        <span className="text-sm text-muted-foreground">
          {safeMails.length} {safeMails.length > 1 ? 'mails' : 'mail'}
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
              isLoading={isMarkingMailsAsRead || isDeletingMails}
            />
          ))
        ) : (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">No mail found</p>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSelectedEmails}
        isDeleting={isDeletingMails}
      />
    </div>
  )
}
