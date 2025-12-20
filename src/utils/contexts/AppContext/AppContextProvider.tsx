import { useState, useEffect, type ReactNode } from 'react'
import { AppContext } from './AppContext'
import { useGetAuthUserQuery } from '@/hooks/auth'

interface AppProviderProps {
  children: ReactNode
}

export default function AppProvider({ children }: AppProviderProps) {
  const [activeNavItem, setActiveNavItem] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [connectionState, setConnectionState] = useState('')
  const [mailFee, setMailFee] = useState(0)
  const [suimailNs, setSuimailNs] = useState('')

  const { data: authUser } = useGetAuthUserQuery()

  useEffect(() => {
    if (authUser?.suimailNs) {
      setSuimailNs(authUser.suimailNs)
    }
  }, [authUser?.suimailNs])

  return (
    <AppContext.Provider
      value={{
        activeNavItem,
        setActiveNavItem,
        walletAddress,
        setWalletAddress,
        connectionState,
        setConnectionState,
        mailFee,
        setMailFee,
        suimailNs,
        setSuimailNs,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
