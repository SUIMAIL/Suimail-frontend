import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import type { IEmail } from '@/types/generic'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { Checkbox } from '../ui/checkbox'
import { useQueryClient } from '@tanstack/react-query'
import { generateRandomId } from '@/utils/helpers'
import mixpanel from '@/utils/mixpanel'
import { useGetUserProfileImageQuery } from '@/hooks/user' // ✅ added

interface EmailTabProps {
  mail: IEmail
  isSelected: boolean
  isLoading: boolean
  onSelect: (mail: IEmail) => void
}

export function EmailTab({
  mail,
  isSelected,
  isLoading,
  onSelect,
}: EmailTabProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const queryClient = useQueryClient()

  const { data: profileImageData } = useGetUserProfileImageQuery() // ✅ fetch logged-in user's image
  const userProfileImage = profileImageData?.imageUrl

  const isInboxPage = useMemo(() => pathname === '/mail/inbox', [pathname])
  const isOutboxPage = useMemo(() => pathname === '/mail/sent', [pathname])

  const [mailIsRead, setMailIsRead] = useState(mail.readAt || isOutboxPage)

  useEffect(() => {
    setMailIsRead(mail.readAt || isOutboxPage)
  }, [mail.readAt, isOutboxPage])

  const renderActorImageUrl = useMemo(() => {
    if (isInboxPage) {
      return mail.sender?.imageUrl || '/images/avatar.png'
    }
    return userProfileImage || mail.recipient?.imageUrl || '/images/avatar.png'
  }, [isInboxPage, mail, userProfileImage])

  const renderActorSuimailNs = useMemo(() => {
    if (isInboxPage) {
      if (!mail.sender?.suimailNs) {
        return mail.metadata?.sender.identifier || ''
      }
      return mail.sender.suimailNs
    }

    if (!mail.recipient?.suimailNs) {
      return mail.metadata?.recipient.identifier || ''
    }

    return mail.recipient.suimailNs
  }, [isInboxPage, mail])

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

    setMailIsRead(true)
    updateMailReadStatus()

    mixpanel.track('Go To Mail', {
      mail_id: mail.id,
      path: isInboxPage ? 'inbox' : 'sent',
    })

    navigate(`/mail/${isInboxPage ? 'inbox' : 'sent'}/${mail.id}`)
  }

  return (
    <Link
      to={`/mail/${isInboxPage ? 'inbox' : 'sent'}/${mail.id}`}
      className={cn(
        'block w-full',
        isLoading && 'opacity-70 pointer-events-none'
      )}
      onClick={handleGoToMail}
    >
      <div
        className={cn(
          'group relative flex flex-col gap-1 border-b border-border p-4 transition-all hover:bg-blue-base/5 hover:elevation-1 sm:flex-row sm:items-center sm:gap-4',
          !mailIsRead && 'bg-accent',
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
              alt={mail.sender?.suimailNs || generateRandomId()}
              className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-border"
            />
            {!mailIsRead && (
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-blue-base ring-2 ring-background" />
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                'truncate text-sm text-muted-foreground',
                !mailIsRead && 'font-semibold text-foreground'
              )}
            >
              {renderActorSuimailNs}
            </p>
            <div className="flex items-center gap-2">
              <time
                className="flex items-center whitespace-nowrap text-xs text-muted-foreground"
                dateTime={mail.createdAt}
              >
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(mail.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>

          <h3
            className={cn(
              'line-clamp-1 text-sm text-muted-foreground',
              !mailIsRead && 'font-medium text-foreground'
            )}
          >
            {mail.subject}
          </h3>
        </div>
      </div>
    </Link>
  )
}
