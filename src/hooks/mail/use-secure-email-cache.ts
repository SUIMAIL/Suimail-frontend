import { useState, useEffect, useRef } from 'react'
import { SessionKey } from '@mysten/seal'
import type { SuiClient } from '@mysten/sui/client'
import { decryptMailContent } from '@/utils/decrypt-mail'

interface DecryptedEmail {
  subject: string
  message: string
  timestamp: string
}

interface CacheEntry {
  data: DecryptedEmail
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry>()

const CACHE_TTL = 30 * 60 * 1000

interface UseSecureEmailDecryptionProps {
  mailObjectId?: string
  mailBlobId?: string
  sessionKey: SessionKey | null
  suiClient: SuiClient
  packageId: string
  enabled?: boolean
}

export function useSecureEmailDecryption({
  mailObjectId,
  mailBlobId,
  sessionKey,
  suiClient,
  packageId,
  enabled = true,
}: UseSecureEmailDecryptionProps) {
  const [decryptedContent, setDecryptedContent] =
    useState<DecryptedEmail | null>(null)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)
  const hasDecryptedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!enabled || !mailObjectId || !mailBlobId || !sessionKey) {
      return
    }

    const cacheKey = mailObjectId

    const cached = memoryCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      setDecryptedContent(cached.data)
      setError(null)
      hasDecryptedRef.current = true
      return
    }

    if (hasDecryptedRef.current && decryptedContent) {
      return
    }

    const decrypt = async () => {
      setIsDecrypting(true)
      setError(null)

      try {
        const result = await decryptMailContent({
          mailBlobId,
          mailObjectId,
          sessionKey,
          suiClient,
          packageId,
        })

        if (!isMountedRef.current) return

        memoryCache.set(cacheKey, {
          data: result,
          expiresAt: Date.now() + CACHE_TTL,
        })

        setDecryptedContent(result)
        setError(null)
        hasDecryptedRef.current = true
      } catch (err: any) {
        if (!isMountedRef.current) return

        console.error('❌ [Decrypt] Decryption failed:', err)
        setError(err.message || 'Failed to decrypt email')
        setDecryptedContent(null)
      } finally {
        if (isMountedRef.current) {
          setIsDecrypting(false)
        }
      }
    }

    decrypt()
  }, [mailObjectId, mailBlobId, sessionKey, suiClient, packageId, enabled])

  useEffect(() => {
    hasDecryptedRef.current = false
  }, [mailObjectId])

  const clearCache = (mailId?: string) => {
    if (mailId) {
      memoryCache.delete(mailId)
    } else {
      memoryCache.clear()
    }
  }

  const retry = () => {
    if (mailObjectId) {
      memoryCache.delete(mailObjectId)
      hasDecryptedRef.current = false
      setError(null)
      setDecryptedContent(null)
    }
  }

  return {
    decryptedContent,
    isDecrypting,
    error,
    retry,
    clearCache,
  }
}

export function startCacheCleanup() {
  const cleanup = () => {
    const now = Date.now()
    let cleaned = 0
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt < now) {
        memoryCache.delete(key)
        cleaned++
      }
    }
    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} expired cache entries`)
    }
  }

  const interval = setInterval(cleanup, 5 * 60 * 1000)

  return () => clearInterval(interval)
}
