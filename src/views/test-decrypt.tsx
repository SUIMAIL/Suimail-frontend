// src/pages/TestDecrypt.tsx

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { decryptMailContent } from '@/utils/decrypt-mail'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useSessionKey } from '@/hooks/mail/use-session-key'
import { useSuiClient } from '@mysten/dapp-kit'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID

export default function TestDecrypt() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const currentAccount = useCurrentAccount()
  const {
    sessionKey,
    loading: sessionKeyLoading,
    error: sessionKeyError,
  } = useSessionKey(PACKAGE_ID)
  const suiClient = useSuiClient()

  // =======================
  // PUT YOUR TEST DATA HERE
  // =======================
  const TEST_MAIL_BLOB_ID = 'aq0nzBJ7g0SlN_KPHz0uuZbgjtFbr7RkbY8jiqA5hAw'
  const TEST_MAIL_OBJECT_ID =
    '0x858f98907e5795e32796ca900415b19591b0ad28006b07ec52e2b6a467a1a20d'

  const handleTestDecrypt = async () => {
    if (!sessionKey) {
      setError('Session key not ready yet')
      return
    }

    try {
      console.log('🔓 Starting test decryption...')
      console.log('Blob ID:', TEST_MAIL_BLOB_ID)
      console.log('Mail Object ID:', TEST_MAIL_OBJECT_ID)

      setIsLoading(true)
      setError(null)
      setResult(null)

      const decrypted = await decryptMailContent({
        mailBlobId: TEST_MAIL_BLOB_ID,
        mailObjectId: TEST_MAIL_OBJECT_ID,
        sessionKey,
        suiClient,
        packageId: PACKAGE_ID,
      })

      console.log('✅ DECRYPTION SUCCESS!')
      console.log('Result:', decrypted)

      setResult(decrypted)
    } catch (err: any) {
      console.error('❌ DECRYPTION FAILED:', err)
      setError(err.message || 'Decryption failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 surface-base">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Decrypt Function</h1>

        {/* Wallet Status */}
        <div className="mb-6 p-4 surface-light rounded-lg border border-border">
          <h2 className="font-semibold mb-2">Wallet Status</h2>
          {currentAccount?.address ? (
            <div className="text-sm">
              <p className="text-green-600">✅ Connected</p>
              <p className="text-muted-foreground mt-1">
                Address: {currentAccount.address.slice(0, 10)}...
                {currentAccount.address.slice(-8)}
              </p>
            </div>
          ) : (
            <p className="text-red-600">❌ Not connected</p>
          )}
        </div>

        {/* Test Data */}
        <div className="mb-6 p-4 surface-light rounded-lg border border-border">
          <h2 className="font-semibold mb-2">Test Data</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Blob ID:</span>
              <code className="ml-2 bg-surface-dark px-2 py-1 rounded">
                {TEST_MAIL_BLOB_ID}
              </code>
            </div>
            <div>
              <span className="font-medium">Mail Object ID:</span>
              <code className="ml-2 bg-surface-dark px-2 py-1 rounded">
                {TEST_MAIL_OBJECT_ID}
              </code>
            </div>
            <div>
              <span className="font-medium">Package ID:</span>
              <code className="ml-2 bg-surface-dark px-2 py-1 rounded">
                {PACKAGE_ID}
              </code>
            </div>
          </div>
        </div>

        {/* Session Key Status */}
        <div className="mb-6 p-4 surface-light rounded-lg border border-border">
          <h2 className="font-semibold mb-2">Session Key</h2>
          {sessionKeyError && (
            <p className="text-red-600 text-sm">❌ Error: {sessionKeyError}</p>
          )}
          {sessionKeyLoading && (
            <p className="text-blue-600 text-sm">🔄 Creating session key...</p>
          )}
          {sessionKey && !sessionKeyLoading && (
            <p className="text-green-600 text-sm">✅ Session key ready</p>
          )}
          {!sessionKey && !sessionKeyLoading && !sessionKeyError && (
            <p className="text-yellow-600 text-sm">
              ⏳ Waiting to create session key...
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-6">
          <Button
            onClick={handleTestDecrypt}
            disabled={isLoading || !sessionKey || sessionKeyLoading}
            className="w-full"
            size="lg"
            variant="secondary"
          >
            {isLoading ? 'Decrypting...' : 'Test Decrypt'}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-blue-600">Processing...</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h3 className="font-semibold text-red-600 mb-2">❌ Error</h3>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        )}

        {/* Success Result */}
        {result && !error && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h3 className="font-semibold text-green-600 mb-2">
              ✅ Decryption Success!
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-sm">Subject:</span>
                <p className="mt-1 p-2 bg-surface-dark rounded">
                  {result.subject}
                </p>
              </div>
              <div>
                <span className="font-medium text-sm">Message:</span>
                <p className="mt-1 p-2 bg-surface-dark rounded whitespace-pre-wrap">
                  {result.message}
                </p>
              </div>
              <div>
                <span className="font-medium text-sm">Timestamp:</span>
                <p className="mt-1 p-2 bg-surface-dark rounded">
                  {result.timestamp}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-600">
            💡 Check your browser console (F12) for detailed logs during
            decryption
          </p>
        </div>
      </div>
    </div>
  )
}
