import { useMemo, useState, useEffect } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useFetchDraftsQuery } from '@/hooks/mail'
import {
  PageLayout,
  MailBoardPageLayout,
  DefaultPagePadding,
} from '@/components/layouts'
import { ExtendedToolbar } from '@/components/ExtendedToolbar'
import { EmailList } from '@/components/EmailViewComponents/EmailList'
import type { IEmail } from '@/types/generic'
import { downloadAndDecryptDraftPreview } from '@/utils/draft-helpers'

export default function DraftsPage() {
  const currentAccount = useCurrentAccount()
  const {
    data: draftsResponse,
    isFetching,
    isError,
    refetch,
  } = useFetchDraftsQuery()
  const [draftsAsMails, setDraftsAsMails] = useState<IEmail[]>([])
  const [searchResults, setSearchResults] = useState<IEmail[]>([])
  const [isSearchActive, setIsSearchActive] = useState(false)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refetch])

  useEffect(() => {
    if (
      draftsResponse?.drafts &&
      Array.isArray(draftsResponse.drafts) &&
      currentAccount?.address
    ) {
      const transformDrafts = async () => {
        const transformed = await Promise.all(
          draftsResponse.drafts.map(async draft => {
            try {
              const isWalrusFormat = draft.walrusBlobId

              let content
              if (isWalrusFormat) {
                // New Walrus format
                content = await downloadAndDecryptDraftPreview({
                  blobId: draft.walrusBlobId,
                  userAddress: currentAccount.address,
                })
              } else {
                // Old backend format (backward compatibility)
                // You can import the legacy decryptDraftPreview if needed
                // or remove this branch after full migration
                content = {
                  subject: '(Legacy draft)',
                  message: '(Please re-save this draft)',
                  timestamp: draft.createdAt || new Date().toISOString(),
                }
              }

              return {
                id: draft.id,
                subject: content.subject || '(No subject)',
                sender: null,
                recipient: draft.recipientId
                  ? { suimailNs: draft.recipientId, imageUrl: undefined }
                  : null,
                createdAt: draft.createdAt,
                updatedAt: draft.updatedAt,
                readAt: null,
                attachments: [],
                metadata: {
                  isDraft: true,
                  draftMessage: content.message,
                  sender: { identifier: '' },
                  recipient: { identifier: draft.recipientId || '' },
                  walrusBlobId: draft.walrusBlobId,
                },
              } as unknown as IEmail
            } catch (error) {
              console.error(`Failed to decrypt draft ${draft.id}:`, error)
              return {
                id: draft.id,
                subject: '(Encrypted Draft)',
                sender: null,
                recipient: draft.recipientId
                  ? { suimailNs: draft.recipientId, imageUrl: undefined }
                  : null,
                createdAt: draft.createdAt,
                updatedAt: draft.updatedAt,
                readAt: null,
                attachments: [],
                metadata: {
                  isDraft: true,
                  decryptError: true,
                  draftMessage: '(Click to view)',
                  sender: { identifier: '' },
                  recipient: { identifier: draft.recipientId || '' },
                  walrusBlobId: draft.walrusBlobId,
                },
              } as unknown as IEmail
            }
          })
        )
        setDraftsAsMails(transformed)
      }

      transformDrafts().catch(err => {
        console.error('Error transforming drafts:', err)
      })
    } else if (!currentAccount?.address) {
      setDraftsAsMails([])
    } else {
      setDraftsAsMails([])
    }
  }, [draftsResponse, currentAccount])

  const drafts = useMemo(() => {
    return draftsAsMails || []
  }, [draftsAsMails])

  const handleSearchResults = (results: IEmail[]) => {
    setSearchResults(results)
    setIsSearchActive(results.length > 0)
  }

  const handleSearchClose = () => {
    setSearchResults([])
    setIsSearchActive(false)
  }

  const displayMails = isSearchActive ? searchResults : drafts

  return (
    <PageLayout loading={isFetching} isError={isError}>
      <ExtendedToolbar
        getPageTitle={() => (isSearchActive ? 'Search Results' : 'Drafts')}
        onSearchResults={handleSearchResults}
        onSearchClose={handleSearchClose}
      />
      <DefaultPagePadding>
        <MailBoardPageLayout>
          {!currentAccount?.address ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-lg font-medium text-yellow-600">
                ⚠️ No wallet connected
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Connect your wallet to view encrypted drafts
              </p>
            </div>
          ) : isSearchActive && searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No results found
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <EmailList
              refetch={refetch}
              mails={displayMails as IEmail[]}
              isDraftView={true}
            />
          )}
        </MailBoardPageLayout>
      </DefaultPagePadding>
    </PageLayout>
  )
}
