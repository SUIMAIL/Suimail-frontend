import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import type { IEmail } from '@/types/generic'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { Checkbox } from '../ui/checkbox'
import { useQueryClient } from '@tanstack/react-query'
import { generateRandomId } from '@/utils/helpers'

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
    return mail.recipient?.imageUrl || '/images/avatar.png'
  }, [isInboxPage, mail])

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
    const updateFunction = (oldData: any) => {
      if (!oldData) return oldData

      // Handle different data structures
      if (oldData.pages) {
        // Infinite query structure
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
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
        // Simple array structure
        return oldData.map((m: IEmail) =>
          m.id === mail.id ? { ...m, readAt: new Date().toISOString() } : m
        )
      } else if (oldData.data && Array.isArray(oldData.data)) {
        // Object with data array
        return {
          ...oldData,
          data: oldData.data.map((m: IEmail) =>
            m.id === mail.id ? { ...m, readAt: new Date().toISOString() } : m
          ),
        }
      }

      return oldData
    }

    // Update both inbox and outbox caches to be safe
    queryClient.setQueriesData({ queryKey: ['inbox-mails'] }, updateFunction)
    queryClient.setQueriesData({ queryKey: ['outbox-mails'] }, updateFunction)

    // Also update any specific mail-body cache
    queryClient.setQueryData(['mail-body', mail.id], (oldData: any) => {
      if (!oldData) return oldData
      return { ...oldData, readAt: new Date().toISOString() }
    })
  }

  const handleGoToMail = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    setMailIsRead(true)

    updateMailReadStatus()

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
          'group relative flex flex-col gap-1 border-b p-4 transition-all hover:bg-blue-50 sm:flex-row sm:items-center sm:gap-4',
          !mailIsRead && 'bg-gray-50',
          isSelected && 'bg-blue-50'
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
              alt={mail.sender.suimailNs || generateRandomId()}
              className="h-9 w-9 rounded-full object-cover overflow-hidden"
            />
            {!mailIsRead && (
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-blue-500" />
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                'truncate text-sm text-gray-600',
                !mailIsRead && 'font-medium text-gray-900'
              )}
            >
              {renderActorSuimailNs}
            </p>
            <div className="flex items-center gap-2">
              <time
                className="flex items-center whitespace-nowrap text-xs text-gray-400"
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
              'line-clamp-1 text-sm text-gray-600',
              !mailIsRead && 'font-medium text-gray-900'
            )}
          >
            {mail.subject}
          </h3>
        </div>
      </div>
    </Link>
  )
}
