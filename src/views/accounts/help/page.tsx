import { useState } from 'react'
import { ExtendedToolbar } from '@/components/ExtendedToolbar'
import { HelpSidebar } from './components/HelpSidebar'
import { QuickStartSection } from './components/QuickStartSection'
import { FAQSection } from './components/FAQSection'
import { ContactSupport } from './components/ContactSupport'
import { Chatbot } from './components/Chatbot'

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div className="relative min-h-screen">
      <ExtendedToolbar getPageTitle={() => 'Help Center'} />

      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <div className="absolute inset-0 surface-base" />
        <div className="relative z-30">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-1">
              <HelpSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>

            <div className="xl:col-span-3">
              <QuickStartSection />
              <FAQSection />
              <ContactSupport />
            </div>
          </div>
        </div>

        <Chatbot />
      </div>
    </div>
  )
}
