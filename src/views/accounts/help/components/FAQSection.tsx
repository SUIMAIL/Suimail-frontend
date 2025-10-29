import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  category: string
  items: FAQItem[]
}

const faqs: FAQCategory[] = [
  {
    category: 'About Suimail',
    items: [
      {
        question: 'What is Suimail?',
        answer:
          'Suimail is a decentralized, blockchain-based email platform built on the Sui network. It allows you to send and receive encrypted emails using your Sui wallet, ensuring privacy, security, and true ownership of your communications.',
      },
      {
        question: 'How is Suimail different from traditional email?',
        answer:
          'Unlike traditional email, Suimail stores your messages on the Sui blockchain, making them tamper-proof and censorship-resistant. All emails are end-to-end encrypted, and only you and your recipient can read them.',
      },
      {
        question: 'Do I need a Sui wallet to use Suimail?',
        answer:
          'Yes, a Sui-compatible wallet is required to use Suimail. Your wallet is used to sign in, send/receive emails, and manage your encryption keys.',
      },
    ],
  },
  {
    category: 'Wallet & Security',
    items: [
      {
        question: 'Is my data secure on Suimail?',
        answer:
          'Absolutely! All emails are encrypted end-to-end before being stored on the Sui blockchain. Only you and your recipient can decrypt and read your messages.',
      },
      {
        question: 'What happens if I lose my wallet?',
        answer:
          'If you lose access to your wallet, you lose access to your Suimail account and email history. Always back up your wallet seed phrase securely.',
      },
    ],
  },
  {
    category: 'Features & Usage',
    items: [
      {
        question: 'Can I send attachments?',
        answer:
          'Yes! Suimail supports encrypted file attachments. The maximum size depends on your subscription plan.',
      },
      {
        question: 'How much does it cost to send an email?',
        answer:
          'Sending an email on Suimail costs a small blockchain fee (gas), usually less than 0.001 SUI per message.',
      },
      {
        question: 'Can I use Suimail on mobile?',
        answer:
          'Yes, Suimail is accessible on both desktop and mobile browsers. A mobile app is coming soon!',
      },
    ],
  },
]

export function FAQSection() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-blue-100 dark:border-neutral-800 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Frequently Asked Questions
      </h2>

      {faqs.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-8">
          <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4 border-b border-blue-100 dark:border-neutral-800 pb-2">
            {category.category}
          </h3>
          <div className="space-y-3">
            {category.items.map((faq, faqIndex) => {
              const globalIndex = categoryIndex * 10 + faqIndex
              return (
                <div
                  key={faqIndex}
                  className="border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(globalIndex)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {faq.question}
                    </span>
                    {expandedFaq === globalIndex ? (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  {expandedFaq === globalIndex && (
                    <div className="px-4 pb-4 text-gray-700 dark:text-gray-200 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
