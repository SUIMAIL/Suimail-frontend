import { useMemo, useState } from 'react'
import { useFetchInboxQuery } from '@/hooks/mail'
import {
  PageLayout,
  MailBoardPageLayout,
  DefaultPagePadding,
} from '@/components/layouts'
import { ExtendedToolbar } from '@/components/ExtendedToolbar'
import { EmailList } from '@/components/EmailViewComponents/EmailList'
import type { IEmail } from '@/types/generic'

export default function InboxPage() {
  const { data: inbox, isFetching, isError, refetch } = useFetchInboxQuery()
  const [searchResults, setSearchResults] = useState<IEmail[]>([])
  const [isSearchActive, setIsSearchActive] = useState(false)

  const inboxMails = useMemo(() => {
    return inbox?.data || []
  }, [inbox])

  const handleSearchResults = (results: IEmail[]) => {
    setSearchResults(results)
    setIsSearchActive(results.length > 0)
  }

  const handleSearchClose = () => {
    setSearchResults([])
    setIsSearchActive(false)
  }

  // Display search results when searching, otherwise show inbox
  const displayMails = isSearchActive ? searchResults : inboxMails

  return (
    <PageLayout loading={isFetching} isError={isError}>
      <ExtendedToolbar
        getPageTitle={() => (isSearchActive ? 'Search Results' : 'Inbox')}
        currentFolder="inbox"
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
