import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, FileEdit } from 'lucide-react'
import type { IEmail } from '@/types/generic'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { Checkbox } from '../ui/checkbox'
import { useQueryClient } from '@tanstack/react-query'
import { generateRandomId } from '@/utils/helpers'
import mixpanel from '@/utils/mixpanel'
import { useGetUserProfileImageQuery } from '@/hooks/user'

interface EmailTabProps {
  mail: IEmail
  isSelected: boolean
  isLoading: boolean
  onSelect: (mail: IEmail) => void
  isDraftView?: boolean
}

export function EmailTab({
  mail,
  isSelected,
  isLoading,
  onSelect,
  isDraftView = false,
}: EmailTabProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const queryClient = useQueryClient()

  const { data: profileImageData } = useGetUserProfileImageQuery()
  const userProfileImage = profileImageData?.imageUrl

  const isInboxPage = useMemo(() => pathname === '/mail/inbox', [pathname])
  const isOutboxPage = useMemo(() => pathname === '/mail/sent', [pathname])
  const isDraftsPage = useMemo(
    () => pathname === '/mail/drafts' || isDraftView,
    [pathname, isDraftView]
  )

  const [mailIsRead, setMailIsRead] = useState(
    mail.readAt || isOutboxPage || isDraftsPage
  )

  useEffect(() => {
    setMailIsRead(mail.readAt || isOutboxPage || isDraftsPage)
  }, [mail.readAt, isOutboxPage, isDraftsPage])

  const renderActorImageUrl = useMemo(() => {
    if (isDraftsPage) {
      // For drafts, show user's own image
      return userProfileImage || '/images/avatar.png'
    }
    if (isInboxPage) {
      return mail.sender?.imageUrl || '/images/avatar.png'
    }
    return userProfileImage || mail.recipient?.imageUrl || '/images/avatar.png'
  }, [isInboxPage, isDraftsPage, mail, userProfileImage])

  const renderActorSuimailNs = useMemo(() => {
    if (isDraftsPage) {
      // For drafts, show recipient
      if (!mail.recipient?.suimailNs) {
        return mail.metadata?.recipient?.identifier || '(No recipient)'
      }
      return mail.recipient.suimailNs
    }

    if (isInboxPage) {
      if (!mail.sender?.suimailNs) {
        return mail.metadata?.sender?.identifier || ''
      }
      return mail.sender.suimailNs
    }

    if (!mail.recipient?.suimailNs) {
      return mail.metadata?.recipient?.identifier || ''
    }

    return mail.recipient.suimailNs
  }, [isInboxPage, isDraftsPage, mail])

  const updateMailReadStatus = () => {
    const updateFunction = (oldData: unknown) => {
      if (!oldData) return oldData

      if (typeof oldData === 'object' && oldData && 'pages' in oldData) {
        return {
          ...oldData,
          pages: (oldData as { pages: any[] }).pages.map(page => ({
            ...page,
            data:
              page.data?.map((m: IEmail) =>
                m.id === mail.id
                  ? { ...m, readAt: new Date().toISOString() }
                  : m
              ) || page.data,
          })),
        }
      } else if (Array.isArray(oldData)) {
        return oldData.map((m: IEmail) =>
          m.id === mail.id ? { ...m, readAt: new Date().toISOString() } : m
        )
      } else if (
        typeof oldData === 'object' &&
        oldData &&
        'data' in oldData &&
        Array.isArray((oldData as { data: IEmail[] }).data)
      ) {
        return {
          ...oldData,
          data: (oldData as { data: IEmail[] }).data.map((m: IEmail) =>
            m.id === mail.id ? { ...m, readAt: new Date().toISOString() } : m
          ),
        }
      }

      return oldData
    }

    queryClient.setQueriesData({ queryKey: ['inbox-mails'] }, updateFunction)
    queryClient.setQueriesData({ queryKey: ['outbox-mails'] }, updateFunction)

    queryClient.setQueryData(['mail-body', mail.id], (oldData: unknown) => {
      if (!oldData) return oldData
      return { ...oldData, readAt: new Date().toISOString() }
    })
  }

  const handleGoToMail = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    if (isDraftsPage) {
      mixpanel.track('Edit Draft', {
        draft_id: mail.id,
      })
      navigate(`/mail/compose?draftId=${mail.id}`)
      return
    }

    setMailIsRead(true)
    updateMailReadStatus()

    mixpanel.track('Go To Mail', {
      mail_id: mail.id,
      path: isInboxPage ? 'inbox' : 'sent',
    })

    navigate(`/mail/${isInboxPage ? 'inbox' : 'sent'}/${mail.id}`)
  }

  const linkUrl = useMemo(() => {
    if (isDraftsPage) {
      return `/mail/compose?draftId=${mail.id}`
    }
    return `/mail/${isInboxPage ? 'inbox' : 'sent'}/${mail.id}`
  }, [isDraftsPage, isInboxPage, mail.id])

  return (
    <Link
      to={linkUrl}
      className={cn(
        'block w-full',
        isLoading && 'opacity-70 pointer-events-none'
      )}
      onClick={handleGoToMail}
    >
      <div
        className={cn(
          'group relative flex flex-col gap-1 border-b border-border p-4 transition-all hover:bg-blue-base/5 hover:elevation-1 sm:flex-row sm:items-center sm:gap-4',
          !mailIsRead && !isDraftsPage && 'bg-accent',
          isSelected && 'bg-blue-base/10 border-l-2 border-l-blue-base'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(mail)}
            />
          </div>

          <div className="relative flex-shrink-0">
            <img
              src={renderActorImageUrl}
              alt={
                mail.sender?.suimailNs ||
                mail.recipient?.suimailNs ||
                generateRandomId()
              }
              className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-border"
            />
            {isDraftsPage ? (
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-background">
                <FileEdit className="h-2 w-2 text-white" />
              </span>
            ) : (
              !mailIsRead && (
                <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-blue-base ring-2 ring-background" />
              )
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <p
                className={cn(
                  'truncate text-sm text-muted-foreground',
                  !mailIsRead &&
                    !isDraftsPage &&
                    'font-semibold text-foreground'
                )}
              >
                {isDraftsPage && 'To: '}
                {renderActorSuimailNs}
              </p>
              {isDraftsPage && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 whitespace-nowrap">
                  <FileEdit className="h-3 w-3" />
                  Draft
                </span>
              )}
              {mail.metadata?.decryptError && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive whitespace-nowrap">
                  Decrypt Error
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <time
                className="flex items-center whitespace-nowrap text-xs text-muted-foreground"
                dateTime={new Date(
                  mail.updatedAt || mail.createdAt
                ).toISOString()}
              >
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(mail.updatedAt || mail.createdAt).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                  }
                )}
              </time>
            </div>
          </div>

          <h3
            className={cn(
              'line-clamp-1 text-sm text-muted-foreground',
              !mailIsRead && !isDraftsPage && 'font-medium text-foreground'
            )}
          >
            {mail.subject}
          </h3>

          {mail.attachments && mail.attachments.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <svg
                className="w-3 h-3 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span className="text-xs text-muted-foreground">
                {mail.attachments.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
