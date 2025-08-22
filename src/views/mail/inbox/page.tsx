import { useMemo } from 'react'
import { useFetchInboxQuery } from '@/hooks/mail'
import {
  PageLayout,
  MailBoardPageLayout,
  DefaultPagePadding,
} from '@/components/layouts'
import { ExtendedToolbar } from '@/components/ExtendedToolbar'
import { EmailList } from '@/components/EmailViewComponents/EmailList'

export default function InboxPage() {
  const { data: inbox, isFetching, isError, refetch } = useFetchInboxQuery()

  const mails = useMemo(() => {
    return inbox?.data || []
  }, [inbox])

  return (
    <PageLayout loading={isFetching} isError={isError}>
      <ExtendedToolbar getPageTitle={() => 'Inbox'} />
      <DefaultPagePadding>
        <MailBoardPageLayout>
          <EmailList refetch={refetch} mails={mails} />
        </MailBoardPageLayout>
      </DefaultPagePadding>
    </PageLayout>
  )
}
