import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useState, createContext, useContext, useEffect } from 'react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import { setCookie } from '@/utils/helpers/auth'
import { ACCESS_TOKEN_COOKIE_NAME } from '@/constants'
import { useDisconnectWallet } from '@mysten/dapp-kit'
import mixpanel from '@/utils/mixpanel'

export function LogoutModal({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (value: boolean) => void
}) {
  const navigate = useNavigate()

  const { mutateAsync: disconnect } = useDisconnectWallet()

  useEffect(() => {
    if (open) {
      document.body.style.pointerEvents = ''
    }
  }, [open])

  const handleLogout = async () => {
    await disconnect().then(() => {
      mixpanel.track('Logout Success')
      mixpanel.reset()
      setCookie(ACCESS_TOKEN_COOKIE_NAME, '', new Date(0))
      navigate('/')
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out of your account. You can sign back in at any
            time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 w-full flex flex-col gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface LogoutModalContextProps {
  open: boolean
  setOpen: (value: boolean) => void
}

const LogoutModalContext = createContext<LogoutModalContextProps>({
  open: false,
  setOpen: () => {},
})

export function LogoutModalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <LogoutModalContext.Provider value={{ open, setOpen }}>
      {children}
    </LogoutModalContext.Provider>
  )
}

export function useLogoutModal() {
  const context = useContext(LogoutModalContext)

  if (!context) {
    throw new Error('useLogoutModal must be used within a LogoutModalProvider')
  }

  return context
}
