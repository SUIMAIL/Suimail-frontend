import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from '../AppSidebar'
import { ComposeButton } from '../ComposeButton'
import { useGetAuthUserQuery } from '@/hooks/auth'
import { Loading } from '../Loading'
import useMediaQuery from '@/hooks/useMediaQuery'
import { useMemo } from 'react'
import { LogoutModal, useLogoutModal } from '../modals/LogoutModal'
import { FeedbackButton } from '../Feedback'

const MailBoardLayout = () => {
  const { data: user, isFetching } = useGetAuthUserQuery()

  const { pathname } = useLocation()

  const isMobile = useMediaQuery('(max-width: 768px)')

  // Only show ComposeButton and floating FeedbackButton on these mail pages
  const allowedMailPages = useMemo(
    () => ['/mail/inbox', '/mail/outbox', '/mail/drafts', '/mail/trash'],
    []
  )
  const showComposeButton = useMemo(
    () => allowedMailPages.includes(pathname),
    [pathname, allowedMailPages]
  )
  const showFloatingFeedback = useMemo(
    () => allowedMailPages.includes(pathname),
    [pathname, allowedMailPages]
  )

  const isComposePage = useMemo(() => pathname === '/mail/compose', [pathname])
  const isHelpPage = useMemo(() => pathname === '/account/help', [pathname])

  const { open, setOpen } = useLogoutModal()

  if (isFetching) return <Loading />

  if (!user?.suimailNs) {
    return <Navigate to="/onboarding" />
  }

  return (
    <>
      <AppSidebar />
      <main className="relative flex-1">
        <Outlet />
        {isMobile && !isComposePage && !isHelpPage && showFloatingFeedback && (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              display: showComposeButton ? 'flex' : undefined,
              flexDirection: showComposeButton ? 'column' : undefined,
              gap: showComposeButton ? 0 : undefined,
              zIndex: 50,
            }}
          >
            <FeedbackButton />
            {showComposeButton && (
              <div style={{ marginTop: 2 }}>
                <ComposeButton />
              </div>
            )}
          </div>
        )}
        {!isMobile && <FeedbackButton />}
      </main>
      <LogoutModal open={open} setOpen={setOpen} />
    </>
  )
}

export default MailBoardLayout
