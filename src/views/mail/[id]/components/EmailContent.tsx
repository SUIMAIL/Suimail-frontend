import { SessionKey } from '@mysten/seal'
import { SuiClient } from '@mysten/sui/client'
import type { IEmail } from '@/types/generic'
import type { DecryptedContent } from '../types'
import { QuotedMessage } from './QuotedMessage'
import { MessageBody } from './MessageBody'
import { MessageHeader } from './MessageHeader'

interface EmailContentProps {
  latestMail: IEmail
  quotedMessages: IEmail[]
  expandedQuotes: Set<string>
  decryptedContent: DecryptedContent | null
  isDecrypting: boolean
  onToggleQuote: (emailId: string) => void
  sessionKey: SessionKey | null
  suiClient: SuiClient
  packageId: string
}

export function EmailContent({
  latestMail,
  quotedMessages,
  expandedQuotes,
  decryptedContent,
  isDecrypting,
  onToggleQuote,
  sessionKey,
  suiClient,
  packageId,
}: EmailContentProps) {
  return (
    <div className="flex-1 overflow-y-auto smooth-scroll">
      <div className="max-w-4xl mx-auto">
        {/* Quoted Messages */}
        {quotedMessages.length > 0 && (
          <div className="p-4 sm:p-6 space-y-3">
            {quotedMessages.reverse().map(email => (
              <QuotedMessage
                key={email.id}
                email={email}
                isExpanded={expandedQuotes.has(email.id)}
                onToggle={() => onToggleQuote(email.id)}
                sessionKey={sessionKey}
                suiClient={suiClient}
                packageId={packageId}
              />
            ))}
          </div>
        )}

        {/* Latest Message */}
        <div className="border-b border-border surface-light">
          <MessageHeader email={latestMail} />
          <MessageBody
            email={latestMail}
            decryptedContent={decryptedContent}
            isDecrypting={isDecrypting}
            sessionKey={sessionKey}
            suiClient={suiClient}
            packageId={packageId}
          />
        </div>
      </div>
    </div>
  )
}
