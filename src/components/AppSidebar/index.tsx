import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '../ui/sidebar'
import {
  FileEdit,
  HelpCircle,
  Inbox,
  LogOut,
  Plus,
  SendHorizonal,
  Settings,
  Trash2,
  Wallet,
} from 'lucide-react'
import { Profile } from './Profile'
import { Skeleton } from '../ui/skeleton'
import useMediaQuery from '@/hooks/useMediaQuery'
import { useGetAuthUserQuery } from '@/hooks/auth'
import { useLogoutModal } from '../modals/LogoutModal'

interface SidebarItem {
  title: string
  url: string
  icon: React.ReactNode
}

const MailNavigationItems: SidebarItem[] = [
  {
    title: 'Inbox',
    url: '/mail/inbox',
    icon: <Inbox />,
  },
  {
    title: 'Sent',
    url: '/mail/sent',
    icon: <SendHorizonal />,
  },
  {
    title: 'Draft',
    url: '/mail/draft',
    icon: <FileEdit />,
  },
  {
    title: 'Trash',
    url: '/mail/trash',
    icon: <Trash2 />,
  },
]

const AccountNavigationItems: SidebarItem[] = [
  {
    title: 'My Wallet',
    url: '/account/wallet',
    icon: <Wallet />,
  },
]

const HelpNavigationItems: SidebarItem[] = [
  {
    title: 'Help',
    url: '/account/help',
    icon: <HelpCircle />,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: <Settings />,
  },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile, openMobile } = useSidebar()
  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  const { data: user, isFetching } = useGetAuthUserQuery()

  const { setOpen } = useLogoutModal()

  const handleGoTo = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault()
    if (isMobile && openMobile) {
      setOpenMobile(false)
    }
    navigate(url)
  }

  const handleComposeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate('/mail/compose')
  }

  return (
    <Sidebar className="fixed border-r border-border surface-light">
      <SidebarHeader className="py-3 px-4 flex flex-col items-center gap-3">
        <img
          src="/images/Black.png"
          alt="SUIMAIL"
          className="w-[160px] h-auto block dark:hidden"
        />
        <img
          src="/images/White.png"
          alt="SUIMAIL"
          className="w-[160px] h-auto hidden dark:block"
        />

        {!isSmallScreen && (
          <Button
            asChild
            className="w-full bg-blue-base hover:bg-blue-dark text-white py-2.5 px-4 rounded-lg gap-2 touch-target transition-all duration-200 hover:shadow-hover font-medium"
            onClick={handleComposeClick}
          >
            <Link to="">
              <Plus className="size-4" />
              <span>Compose</span>
            </Link>
          </Button>
        )}
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
            Mail
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {MailNavigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    asChild
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === item.url
                        ? 'bg-blue-base/10 text-blue-base'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Link to={item.url} onClick={e => handleGoTo(e, item.url)}>
                      {item.icon}
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="my-2" />
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {AccountNavigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    asChild
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === item.url
                        ? 'bg-blue-base/10 text-blue-base'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Link to={item.url} onClick={e => handleGoTo(e, item.url)}>
                      {item.icon}
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3">
        <SidebarMenu className="px-2 space-y-1">
          {HelpNavigationItems.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={pathname === item.url}
                asChild
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.url
                    ? 'bg-blue-base/10 text-blue-base'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Link to={item.url} onClick={e => handleGoTo(e, item.url)}>
                  {item.icon}
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setOpenMobile(false)
                setOpen(true)
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:text-destructive/90 hover:bg-destructive/10 w-full transition-colors"
            >
              <LogOut className="size-4" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-2" />

        <div className="px-2">
          {isFetching ? (
            <Skeleton className="w-10 h-10 rounded-full" />
          ) : (
            <Profile
              name={user?.suimailNs?.split('@')[0] ?? ''}
              email={user?.suimailNs ?? ''}
            />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
