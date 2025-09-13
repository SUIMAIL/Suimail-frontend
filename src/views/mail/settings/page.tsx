import { useMemo, useState } from 'react'
import type { SettingsTab, SettingsViewType } from './types'
import { SetTabButton } from './components/set-tab-button'
import { NotificationsView } from './views/Notifications'
import { AccountView } from './views/Account'
import { PreferencesView } from './views/Preferences'
import { MailAddressView } from './views/MailAddress'
import { PageLayout } from '@/components/layouts'
import { ExtendedToolbar } from '@/components/ExtendedToolbar'

const tabs: SettingsTab[] = [
  { label: 'Mail Address', view: 'mailaddress' },
  {
    label: 'Notifications',
    view: 'notifications',
  },
  { label: 'Account', view: 'account' },
]

export default function SettingsPage() {
  const [activeView, setActiveView] = useState<SettingsViewType>('mailaddress')

  const views: Record<SettingsViewType, React.ReactNode> = useMemo(() => {
    return {
      mailaddress: <MailAddressView />,
      notifications: <NotificationsView />,
      account: <AccountView />,
      preferences: <PreferencesView />,
    }
  }, [])

  return (
    <PageLayout>
      <ExtendedToolbar getPageTitle={() => 'Settings'} />

      <main className="pt-14 min-h-screen flex flex-col lg:flex-row">
        <aside className="w-full lg:w-64 border-r border-gray-200">
          <div className="flex flex-row lg:flex-col gap-0.5 lg:gap-2 lg:mt-2">
            {tabs.map(({ label, view }) => (
              <SetTabButton
                key={label}
                label={label}
                isActive={activeView === view}
                onClick={() => setActiveView(view)}
              />
            ))}
          </div>
        </aside>

        <main className="flex-1 p-6">{views[activeView]}</main>
      </main>
    </PageLayout>
  )
}
