import { createContext, useContext } from 'react'

export interface AppContextProps {
  activeNavItem: string
  setActiveNavItem: React.Dispatch<React.SetStateAction<string>>
  walletAddress: string
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>
  connectionState: string
  setConnectionState: React.Dispatch<React.SetStateAction<string>>
  mailFee: number
  setMailFee: React.Dispatch<React.SetStateAction<number>>
  suimailNs: string
  setSuimailNs: React.Dispatch<React.SetStateAction<string>>
}

export const AppContext = createContext<AppContextProps | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
