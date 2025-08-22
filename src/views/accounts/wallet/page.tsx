import { useMemo } from 'react'
import { ExtendedToolbar } from '@/components/ExtendedToolbar'
import { HeroCard } from './components/HeroCard'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { AccountNotFoundCard } from './components/AccountNotFoundCard'
import {
  PageLayout,
  DefaultPagePadding,
  MailBoardPageLayout,
} from '@/components/layouts'

export default function WalletPage() {
  const currentAccount = useCurrentAccount()

  const renderHeroCard = useMemo(() => {
    if (!currentAccount) {
      return <AccountNotFoundCard />
    }

    return <HeroCard accountAddress={currentAccount.address} />
  }, [currentAccount])

  return (
    <PageLayout>
      <ExtendedToolbar getPageTitle={() => 'My Wallet'} />

      <DefaultPagePadding>
        <MailBoardPageLayout>
          <div className="flex flex-col gap-4 px-4">{renderHeroCard}</div>
        </MailBoardPageLayout>
      </DefaultPagePadding>
    </PageLayout>
  )
}
