import React, { createContext, useContext, useState, useEffect } from 'react'
import { SessionKey } from '@mysten/seal'
import {
  useCurrentAccount,
  useSuiClient,
  useSignPersonalMessage,
} from '@mysten/dapp-kit'

const TTL_MIN = 30

interface SessionKeyContextType {
  sessionKey: SessionKey | null
  isCreating: boolean
  error: string | null
  refreshSessionKey: () => void
}

const SessionKeyContext = createContext<SessionKeyContextType | undefined>(
  undefined
)

interface SessionKeyProviderProps {
  children: React.ReactNode
  packageId: string
}

export function SessionKeyProvider({
  children,
  packageId,
}: SessionKeyProviderProps) {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const { mutate: signPersonalMessage } = useSignPersonalMessage()

  const [sessionKey, setSessionKey] = useState<SessionKey | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)

  const createSessionKey = async () => {
    if (!currentAccount?.address) {
      return
    }

    if (
      sessionKey &&
      !sessionKey.isExpired() &&
      sessionKey.getAddress() === currentAccount.address &&
      expiresAt &&
      expiresAt > Date.now()
    ) {
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const sk = await SessionKey.create({
        address: currentAccount.address,
        packageId,
        ttlMin: TTL_MIN,
        suiClient,
      })

      signPersonalMessage(
        { message: sk.getPersonalMessage() },
        {
          onSuccess: async res => {
            await sk.setPersonalMessageSignature(res.signature)

            const expiration = Date.now() + TTL_MIN * 60 * 1000

            setSessionKey(sk)
            setExpiresAt(expiration)
            setIsCreating(false)
          },
          onError: (err: any) => {
            console.error(
              '❌ [SessionKey] Failed to sign personal message:',
              err
            )
            setError(err?.message || 'Failed to sign session key')
            setIsCreating(false)
          },
        }
      )
    } catch (err: any) {
      console.error('❌ [SessionKey] Error creating session key:', err)
      setError(err?.message || 'Failed to create session key')
      setIsCreating(false)
    }
  }

  useEffect(() => {
    createSessionKey()
  }, [currentAccount, packageId])

  useEffect(() => {
    if (!sessionKey || !expiresAt || sessionKey.isExpired()) return

    const timeUntilExpiry = expiresAt - Date.now()
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000

    if (refreshTime > 0) {
      const timeout = setTimeout(() => {
        createSessionKey()
      }, refreshTime)

      return () => clearTimeout(timeout)
    } else {
      createSessionKey()
    }
  }, [sessionKey, expiresAt])

  const value: SessionKeyContextType = {
    sessionKey,
    isCreating,
    error,
    refreshSessionKey: createSessionKey,
  }

  return (
    <SessionKeyContext.Provider value={value}>
      {children}
    </SessionKeyContext.Provider>
  )
}

export function useSessionKeyContext() {
  const context = useContext(SessionKeyContext)
  if (context === undefined) {
    throw new Error(
      'useSessionKeyContext must be used within a SessionKeyProvider'
    )
  }
  return context
}
