import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'
import SentPage from './views/mail/sent/page'
import LandingPage from './views/landing/page'
import InboxPage from './views/mail/inbox/page'
import DraftsPage from './views/mail/drafts/page'
import ComposePage from './views/mail/compose/page'
import SettingsPage from './views/mail/settings/page'
import SubscriptionPage from './views/accounts/subscription/page'
import HelpPage from './views/accounts/help/page'
import { DashboardLayout, MailBoardLayout } from './components/layouts'
import TrashPage from './views/mail/trash/page'
import OnboardingPage from './views/onboarding/page'
import { RouterErrorBoundary } from './ErrorBoundary'
import WalletPage from './views/accounts/wallet/page'
import EmailViewPage from './views/mail/[id]/page'
import { useEffect } from 'react'
import { trackPageView } from './utils/mixpanel'

const Layout = () => {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  return <Outlet />
}

const routes = createBrowserRouter([
  {
    element: <Layout />,
    ErrorBoundary: RouterErrorBoundary,
    children: [
      {
        index: true,
        path: '/',
        element: <LandingPage />,
      },
      {
        element: <DashboardLayout />,
        ErrorBoundary: RouterErrorBoundary,
        children: [
          {
            path: '/onboarding',
            element: <OnboardingPage />,
            ErrorBoundary: RouterErrorBoundary,
          },
          {
            path: '/',
            element: <MailBoardLayout />,
            ErrorBoundary: RouterErrorBoundary,
            children: [
              {
                path: '/mail',
                element: <Navigate to="/mail/inbox" replace />,
                ErrorBoundary: RouterErrorBoundary,
              },
              {
                path: '/mail/inbox',
                element: <InboxPage />,
                ErrorBoundary: RouterErrorBoundary,
              },
              {
                path: 'mail/inbox/:id',
                element: <EmailViewPage />,
                ErrorBoundary: RouterErrorBoundary,
              },
              {
                path: '/mail/sent',
                element: <SentPage />,
                ErrorBoundary: RouterErrorBoundary,
              },
              {
                path: '/mail/sent/:id',
                element: <EmailViewPage />,
                ErrorBoundary: RouterErrorBoundary,
              },
              {
                path: '/mail/draft',
                element: <DraftsPage />,
                ErrorBoundary: RouterErrorBoundary,
              },
              {
                path: '/mail/draft/:id',
                element: <EmailViewPage />,
                ErrorBoundary: RouterErrorBoundary,
              },
              {
                path: '/mail/trash',
                element: <TrashPage />,
              },
              {
                path: '/mail/compose',
                element: <ComposePage />,
              },
              {
                path: '/account/subscription',
                element: <SubscriptionPage />,
              },
              {
                path: '/account/wallet',
                element: <WalletPage />,
                ErrorBoundary: RouterErrorBoundary,
              },
              {
                path: '/account/help',
                element: <HelpPage />,
              },
              {
                path: '/settings',
                element: <SettingsPage />,
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

export default routes
