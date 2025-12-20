// src/hooks/mail/use-session-key.ts
import { useEffect, useState } from 'react'
import { SessionKey } from '@mysten/seal'
import {
  useCurrentAccount,
  useSuiClient,
  useSignPersonalMessage,
} from '@mysten/dapp-kit'

const TTL_MIN = 10

export function useSessionKey(PACKAGE_ID: string) {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const { mutate: signPersonalMessage } = useSignPersonalMessage()

  const [sessionKey, setSessionKey] = useState<SessionKey | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentAccount?.address) {
      return
    }

    if (
      sessionKey &&
      !sessionKey.isExpired() &&
      sessionKey.getAddress() === currentAccount.address
    ) {
      return
    }

    const createAndAuthorizeSessionKey = async () => {
      setLoading(true)
      setError(null)

      try {
        const sk = await SessionKey.create({
          address: currentAccount.address,
          PACKAGE_ID,
          ttlMin: TTL_MIN,
          suiClient,
        })

        signPersonalMessage(
          { message: sk.getPersonalMessage() },
          {
            onSuccess: async res => {
              await sk.setPersonalMessageSignature(res.signature)

              setSessionKey(sk)
              setLoading(false)
            },
            onError: (err: any) => {
              console.error(
                '❌ [useSessionKey] Failed to sign personal message:',
                err
              )
              setError(err?.message || 'Failed to sign session key')
              setLoading(false)
            },
          }
        )
      } catch (err: any) {
        console.error('❌ [useSessionKey] Error creating session key:', err)
        setError(err?.message || 'Failed to create session key')
      } finally {
        setLoading(false)
      }
    }

    createAndAuthorizeSessionKey()
  }, [currentAccount, PACKAGE_ID, sessionKey, signPersonalMessage, suiClient])

  return { sessionKey, loading, error }
}
