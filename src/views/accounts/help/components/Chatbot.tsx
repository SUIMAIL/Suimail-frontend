import { useState } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

interface ChatMessage {
  type: 'user' | 'bot'
  message: string
}

export function Chatbot() {
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      type: 'bot',
      message:
        "Hi! I'm your Suimail assistant. I can help you with wallet connection, sending encrypted emails, gas fees, security, and more. What would you like to know?",
    },
  ])
  const [userMessage, setUserMessage] = useState('')

  // Smart chatbot responses
  const getBotResponse = (userInput: string) => {
    const input = userInput.toLowerCase()

    if (input.includes('wallet') || input.includes('connect')) {
      if (input.includes('which') || input.includes('what wallet')) {
        return 'You can use any Sui-compatible wallet like Sui Wallet, Ethos Wallet, or Martian Wallet. I recommend Sui Wallet for the best experience. Make sure you have some SUI tokens for transaction fees!'
      }
      if (input.includes('connect') || input.includes('how')) {
        return "To connect your wallet: 1) Click 'Connect Wallet' in the top-right corner, 2) Select your wallet type, 3) Approve the connection in your wallet popup. Need SUI tokens? You can get them from exchanges like Binance or KuCoin."
      }
      if (
        input.includes('problem') ||
        input.includes('error') ||
        input.includes('not working')
      ) {
        return 'Wallet connection issues? Try: 1) Refresh the page, 2) Make sure your wallet extension is unlocked, 3) Clear browser cache, 4) Try switching to a different network and back. Still stuck? Let me know the exact error message!'
      }

      return 'For wallet help, I can assist with connection, supported wallets, or troubleshooting. What specific wallet issue are you facing?'
    }

    // Email/messaging queries
    if (
      input.includes('email') ||
      input.includes('message') ||
      input.includes('send')
    ) {
      if (
        input.includes('cost') ||
        input.includes('fee') ||
        input.includes('gas')
      ) {
        return 'Sending emails costs very little - typically under 0.001 SUI per message (less than $0.01). The exact fee depends on network congestion. Your wallet will show the exact amount before confirming.'
      }
      if (
        input.includes('private') ||
        input.includes('secure') ||
        input.includes('encrypted')
      ) {
        return 'Yes! All emails are end-to-end encrypted before going on the blockchain. Only you and the recipient can read them using your wallet keys. Much more secure than traditional email!'
      }
      if (
        input.includes('how') &&
        (input.includes('send') || input.includes('compose'))
      ) {
        return "To send an email: 1) Click 'Compose' or the + button, 2) Enter recipient's Sui address or ENS name, 3) Write your message, 4) Click 'Send' and confirm in your wallet. The message will be on-chain in seconds!"
      }
      return 'I can help with sending emails, costs, privacy, or any messaging features. What would you like to know?'
    }

    // Security queries
    if (
      input.includes('security') ||
      input.includes('safe') ||
      input.includes('secure') ||
      input.includes('private')
    ) {
      return "Your emails are super secure! They're encrypted with your wallet keys before going on Sui blockchain. No one can read them without your private key - not even us. Always keep your seed phrase safe and never share it!"
    }

    // SUI token queries
    if (
      input.includes('sui') &&
      (input.includes('token') ||
        input.includes('buy') ||
        input.includes('get'))
    ) {
      return "You can get SUI tokens from major exchanges like Binance, KuCoin, or OKX. You'll need small amounts for sending emails (gas fees). Consider getting at least 1-2 SUI to start - that's enough for hundreds of emails!"
    }

    // Speed/performance queries
    if (
      input.includes('slow') ||
      input.includes('fast') ||
      input.includes('speed')
    ) {
      return 'Sui is super fast! Your emails are typically confirmed in 2-3 seconds. If it seems slow, check your wallet connection and network status. The Sui network processes thousands of transactions per second.'
    }

    // Backup/recovery queries
    if (
      input.includes('backup') ||
      input.includes('recover') ||
      input.includes('lost') ||
      input.includes('seed phrase')
    ) {
      return '⚠️ Important: Your emails are tied to your wallet. If you lose your wallet/seed phrase, you lose access to your email history forever. Always backup your seed phrase securely and never share it with anyone!'
    }

    // Contact/address queries
    if (
      input.includes('contact') ||
      input.includes('address') ||
      input.includes('friend')
    ) {
      return 'To email someone, you need their Sui wallet address (starts with 0x...). You can also use Sui Name Service (SuiNS) names if they have one - much easier to remember! Save frequent contacts for quick access.'
    }

    // General help
    if (
      input.includes('help') ||
      input.includes('start') ||
      input.includes('begin')
    ) {
      return 'Welcome to decentralized email! Start by: 1) Connecting your Sui wallet, 2) Getting some SUI tokens for fees, 3) Sending your first encrypted email. Check our Quick Start guide above for step-by-step instructions!'
    }

    // Error handling
    if (
      input.includes('error') ||
      input.includes('problem') ||
      input.includes('issue')
    ) {
      return "I'm here to help! Can you tell me more about the specific error or problem you're experiencing? Is it related to wallet connection, sending emails, or something else?"
    }

    // Pricing queries
    if (
      input.includes('price') ||
      input.includes('cost') ||
      input.includes('free')
    ) {
      return 'The app is free to use! You only pay tiny blockchain fees (gas) when sending emails - usually less than 0.001 SUI per message. No monthly subscriptions or hidden costs!'
    }

    // Default responses for unmatched queries
    const defaultResponses = [
      "That's a great question! Could you provide more details so I can give you the most helpful answer?",
      "I'd love to help! Can you tell me more about what you're trying to do with the Suimail app?",
      "I'm here to assist with wallet connection, sending emails, security, or any other features. What specific area would you like help with?",
      'Let me help you with that! Are you looking for help with technical issues, getting started, or learning about features?',
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = () => {
    if (!userMessage.trim()) return

    const botResponse = getBotResponse(userMessage)

    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { type: 'user', message: userMessage },
      { type: 'bot', message: botResponse },
    ]

    setChatMessages(newMessages)
    setUserMessage('')
  }

  return (
    <>
      {/* Chatbot Toggle */}
      <button
        onClick={() => setChatbotOpen(!chatbotOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors z-50 dark:shadow-blue-900"
      >
        {chatbotOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chatbot Modal */}
      {chatbotOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-blue-100 dark:border-neutral-800 z-50">
          <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center space-x-3">
            <Bot className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Suimail Assistant</h3>
              <p className="text-sm text-blue-100">Online now</p>
            </div>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-100'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={userMessage}
                onChange={e => setUserMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about wallets, sending emails, fees..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['How to connect wallet?', 'Email costs?', 'Is it secure?'].map(
                suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setUserMessage(suggestion)}
                    className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
