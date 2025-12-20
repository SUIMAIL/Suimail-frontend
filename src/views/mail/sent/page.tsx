import { useMemo } from 'react'
import { useFetchOutboxQuery } from '@/hooks/mail'
import { ExtendedToolbar } from '@/components/ExtendedToolbar'
import { EmailList } from '@/components/EmailViewComponents/EmailList'
import {
  DefaultPagePadding,
  PageLayout,
  MailBoardPageLayout,
} from '@/components/layouts'

export default function SentPage() {
  const { data: outbox, isFetching, isError, refetch } = useFetchOutboxQuery()

  const mails = useMemo(() => {
    return outbox?.outbox || []
  }, [outbox])

  return (
    <PageLayout loading={isFetching} isError={isError} retry={refetch}>
      <ExtendedToolbar getPageTitle={() => 'Sent'} />
      <DefaultPagePadding>
        <MailBoardPageLayout>
          <EmailList refetch={refetch} mails={mails} />
        </MailBoardPageLayout>
      </DefaultPagePadding>
    </PageLayout>
  )
}
