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

  const isComposePage = useMemo(() => pathname === '/mail/compose', [pathname])
  const isHelpPage = useMemo(() => pathname === '/account/help', [pathname])

  const showButtons = useMemo(
    () => !isComposePage && !isHelpPage,
    [isComposePage, isHelpPage]
  )

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
        {isMobile && showButtons && (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              zIndex: 50,
            }}
          >
            <FeedbackButton />
            <ComposeButton />
          </div>
        )}
        {!isMobile && <FeedbackButton />}
      </main>
      <LogoutModal open={open} setOpen={setOpen} />
    </>
  )
}

export default MailBoardLayout
