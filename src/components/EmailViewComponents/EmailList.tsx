import type { IEmail } from '@/types/generic'
import { EmailTab } from './EmailTab'
import { EmailListToolbar } from './EmailListToolbar'
import { useEmailListContext } from './EmailListContext'
import {
  usePostDeleteMailsMutation,
  usePostMarkMailsAsReadMutation,
} from '@/hooks/mail'
import { useToastContext } from '../ui/toast'
import { useMemo } from 'react'
import { sortEmailsByLatest } from '@/utils/helpers/sort-by-latest'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'

interface EmailListProps {
  mails: IEmail[]
  refetch?: () => void
}

export function EmailList({ mails, refetch }: EmailListProps) {
  // Add defensive check for mails prop
  const safeMails = useMemo(() => {
    if (!mails || !Array.isArray(mails)) {
      console.warn('EmailList: mails prop is not an array:', mails)
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
        setNotification({
          message,
          type: 'success',
        })
        queryClient.invalidateQueries({
          queryKey: isInboxPage ? ['inbox-mails'] : ['outbox-mails'],
        })
      })
    } catch {
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

    if (confirm('Are you sure you want to delete these mails?')) {
      try {
        await deleteMails({
          mailIds,
          path: isInboxPage ? 'recipient' : 'sender',
        }).then(() => {
          setNotification({
            message,
            type: 'success',
          })
          queryClient.invalidateQueries({
            queryKey: isInboxPage ? ['inbox-mails'] : ['outbox-mails'],
          })
        })
      } catch {
        setNotification({
          message: 'Failed to delete mails',
          type: 'error',
        })
      }
    }
  }

  const sortedEmails = useMemo(() => {
    return sortEmailsByLatest(safeMails)
  }, [safeMails])

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <EmailListToolbar
          refetch={refetch}
          hasSelectedEmails={hasSelectedEmails}
          handleSelectAllEmails={handleSelectAllEmails}
          handleMarkSelectedEmailsAsRead={handleMarkSelectedEmailsAsRead}
          handleDeleteSelectedEmails={handleDeleteSelectedEmails}
        />

        <span className="text-sm text-gray-500">
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
            <p className="text-sm text-gray-500">No mail found</p>
          </div>
        )}
      </div>
    </div>
  )
}
