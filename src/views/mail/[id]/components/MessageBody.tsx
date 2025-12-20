import { Loader2, Unlock, Lock } from 'lucide-react'
import { SessionKey } from '@mysten/seal'
import type { IEmail } from '@/types/generic'
import type { DecryptedContent } from '../types'
import { EmailBodyFormatter } from '../email-format'
import RenderAttachments from './RenderAttachments'

interface MessageBodyProps {
  email: IEmail
  decryptedContent: DecryptedContent | null
  isDecrypting: boolean
  sessionKey: SessionKey | null
  suiClient: any
  packageId: string
}

export function MessageBody({
  email,
  decryptedContent,
  isDecrypting,
  sessionKey,
  suiClient,
  packageId,
}: MessageBodyProps) {
  return (
    <div className="px-4 sm:px-6 pb-6">
      {isDecrypting ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-base mb-4" />
          <p className="text-muted-foreground mb-2">Decrypting email...</p>
          <p className="text-xs text-muted-foreground">
            Fetching keys from Seal servers
          </p>
        </div>
      ) : decryptedContent ? (
        <>
          <EmailBodyFormatter body={decryptedContent.message} />
          <div className="mt-4 flex items-center text-xs text-green-600">
            <Unlock className="h-4 w-4 mr-1" />
            <span>End-to-end encrypted and decrypted locally</span>
          </div>
        </>
      ) : (
        <>
          <EmailBodyFormatter body={email.body} />
          {email.MailBlobId && (
            <div className="mt-4 flex items-center text-xs text-yellow-600">
              <Lock className="h-4 w-4 mr-1" />
              <span>This message is encrypted but couldn't be decrypted</span>
            </div>
          )}
        </>
      )}

      {email.attachments &&
        Array.isArray(email.attachments) &&
        email.attachments.length > 0 &&
        sessionKey &&
        email.MailobjectId && (
          <div className="mt-6 p-4 surface-dark rounded-lg border border-border elevation-1">
            <div className="text-sm font-medium text-foreground mb-3">
              {email.attachments.length} attachment
              {email.attachments.length > 1 ? 's' : ''}
            </div>

            <RenderAttachments
              attachments={email.attachments}
              mailObjectId={email.MailobjectId}
              sessionKey={sessionKey}
              suiClient={suiClient}
              packageId={packageId}
            />
          </div>
        )}
      {email.digest && (
        <div className="mt-6 p-4 bg-blue-base/10 rounded-lg border border-blue-base/20">
          <div className="flex items-center justify-between">
            <div className="text-sm flex-1 min-w-0 mr-4">
              <div className="font-medium text-blue-base mb-1">
                Blockchain Verified
              </div>
              <div className="text-muted-foreground">
                Transaction:{' '}
                <code className="surface-dark px-2 py-1 rounded text-xs break-all">
                  {email.digest}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
