import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Loading } from '../Loading'
import { getCookie } from '@/utils/helpers/auth'
import { ACCESS_TOKEN_COOKIE_NAME } from '@/constants'
import { useGetAuthUserQuery } from '@/hooks/auth'
import { SidebarProvider } from '../ui/sidebar'
import { LogoutModalProvider } from '../LogoutModal'

const DashboardLayout = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  const isOnboardingPage = useMemo(() => pathname === '/onboarding', [pathname])

  const { data: user, isFetching } = useGetAuthUserQuery()

  const handleAuthFlow = useCallback(async () => {
    try {
      const token = getCookie(ACCESS_TOKEN_COOKIE_NAME)
      if (!token.length) {
        navigate('/')
        return
      }

      if (user?.suimailNs) {
        if (isOnboardingPage) {
          navigate('/mail/inbox')
        }
      } else {
        if (!isFetching) {
          navigate('/onboarding')
        }
      }

      setIsLoading(false)
    } catch {
      navigate('/')
    }
  }, [user?.suimailNs, navigate, isOnboardingPage, isFetching])

  useEffect(() => {
    handleAuthFlow()
  }, [handleAuthFlow])

  if (isLoading) {
    return <Loading />
  }

  return (
    <SidebarProvider>
      <LogoutModalProvider>
        <Outlet />
      </LogoutModalProvider>
    </SidebarProvider>
  )
}

export default DashboardLayout
