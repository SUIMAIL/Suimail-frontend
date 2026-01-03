import { useMemo, useState, useEffect } from 'react'
import { useFetchInboxQuery } from '@/hooks/mail'
import {
  PageLayout,
  MailBoardPageLayout,
  DefaultPagePadding,
} from '@/components/layouts'
import { ExtendedToolbar } from '@/components/ExtendedToolbar'
import { EmailList } from '@/components/EmailViewComponents/EmailList'
import type { IEmail } from '@/types/generic'
// import { decryptMailContent } from '@/utils/mail-helpers' // ✅

export default function InboxPage() {
  const { data: inbox, isFetching, isError, refetch } = useFetchInboxQuery()
  const [decryptedMails, setDecryptedMails] = useState<IEmail[]>([])
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [searchResults, setSearchResults] = useState<IEmail[]>([])
  const [isSearchActive, setIsSearchActive] = useState(false)

  useEffect(() => {
    if (inbox?.inbox && Array.isArray(inbox.inbox)) {
      setIsDecrypting(true)

      const decryptMails = async () => {
        try {
          const decrypted = await Promise.all(
            inbox.inbox.map(async (mail: IEmail) => {
              try {
                return mail
              } catch (error) {
                console.error(`Failed to decrypt mail ${mail.id}:`, error)
                const emailData: IEmail = {
                  ...mail,
                  metadata: {
                    ...mail.metadata,
                    decryptError: true,
                    sender: mail.metadata?.sender || { identifier: '' },
                    recipient: mail.metadata?.recipient || { identifier: '' },
                  },
                }
                return emailData
              }
            })
          )
          setDecryptedMails(decrypted)
        } catch (err) {
          console.error('Error decrypting mails:', err)
          setDecryptedMails(inbox.inbox)
        } finally {
          setIsDecrypting(false)
        }
      }

      decryptMails()
    } else {
      setDecryptedMails([])
      setIsDecrypting(false)
    }
  }, [inbox])

  const inboxMails = useMemo(() => {
    return decryptedMails || []
  }, [decryptedMails])

  const handleSearchResults = (results: IEmail[]) => {
    setSearchResults(results)
    setIsSearchActive(results.length > 0)
  }

  const handleSearchClose = () => {
    setSearchResults([])
    setIsSearchActive(false)
  }

  const displayMails = isSearchActive ? searchResults : inboxMails

  return (
    <PageLayout loading={isFetching || isDecrypting} isError={isError}>
      <ExtendedToolbar
        getPageTitle={() => (isSearchActive ? 'Search Results' : 'Inbox')}
        onSearchResults={handleSearchResults}
        onSearchClose={handleSearchClose}
      />
      <DefaultPagePadding>
        <MailBoardPageLayout>
          {isSearchActive && searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No results found
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <EmailList refetch={refetch} mails={displayMails as IEmail[]} />
          )}
        </MailBoardPageLayout>
      </DefaultPagePadding>
    </PageLayout>
  )
}
