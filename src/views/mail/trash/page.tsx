import { useMemo } from 'react'
import type { IEmail } from '@/types/generic'
import { PageLayout, MailBoardPageLayout } from '@/components/layouts'
import { ExtendedToolbar } from '@/components/ExtendedToolbar'
import { EmailList } from '@/components/EmailViewComponents/EmailList'

export default function TrashPage() {
  const mails: IEmail[] = useMemo(() => [], [])

  return (
    <PageLayout>
      <ExtendedToolbar getPageTitle={() => 'Trash'} />
      <MailBoardPageLayout>
        <div className="pt-16">
          <EmailList mails={mails} />
        </div>
      </MailBoardPageLayout>
    </PageLayout>
  )
}
