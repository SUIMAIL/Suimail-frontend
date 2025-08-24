import { useState, useEffect, useRef } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { IEmail } from '@/types/generic'

interface ReplyComposerProps {
  originalEmail: IEmail
  // onSend: (replyData: {
  //   to: string
  //   subject: string
  //   body: string
  //   inReplyTo: string
  //   originalMessageId: string
  // }) => Promise<void>
  onCancel: () => void
  isVisible: boolean
}

export function ReplyComposer({
  originalEmail,
  // onSend,
  onCancel,
  isVisible,
}: ReplyComposerProps) {
  const [replyBody, setReplyBody] = useState('')
  const [isSending] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus when composer becomes visible
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isVisible])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [replyBody])

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  // Generate quoted original message
  //   const quotedOriginalMessage = `

  // --- Original Message ---
  // From: ${originalEmail.sender.suimailNs}
  // Date: ${formatDate(originalEmail.createdAt)}
  // Subject: ${originalEmail.subject}

  // ${originalEmail.body
  //   .split('\n')
  //   .map(line => `> ${line}`)
  //   .join('\n')}`

  // Generate reply subject (avoid double Re:)
  const replySubject = originalEmail.subject.startsWith('Re: ')
    ? originalEmail.subject
    : `Re: ${originalEmail.subject}`

  // const handleSend = async () => {
  //   // Basic client-side validation
  //   if (!replyBody.trim()) {
  //     setError('Please enter a message')
  //     return
  //   }

  //   if (replyBody.trim().length > 10000) {
  //     setError('Message is too long (maximum 10,000 characters)')
  //     return
  //   }

  //   setIsSending(true)
  //   setError('')

  //   try {
  //     await onSend({
  //       to: originalEmail.sender.suimailNs,
  //       subject: replySubject,
  //       body: replyBody.trim() + quotedOriginalMessage,
  //       inReplyTo: originalEmail.id,
  //       originalMessageId: originalEmail.id,
  //     })

  //     // Reset form on successful send
  //     setReplyBody('')
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to send reply. Please try again.')
  //     console.error('Reply send error:', err)
  //   } finally {
  //     setIsSending(false)
  //   }
  // }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send with Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isSending) {
      e.preventDefault()
      // handleSend()
    }
    // Cancel with Escape
    if (e.key === 'Escape' && !isSending) {
      onCancel()
    }
  }

  const handleCancel = () => {
    if (!isSending) {
      setReplyBody('')
      setError('')
      onCancel()
    }
  }

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 bg-white border-l border-gray-200 shadow-md z-30 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="mr-4 p-2 hover:bg-gray-100 transition-colors"
              onClick={handleCancel}
              disabled={isSending}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
            <h2 className="text-lg font-medium text-gray-900">
              Reply to {originalEmail.sender.suimailNs}
            </h2>
          </div>

          <Button
            // onClick={handleSend}
            disabled={isSending || !replyBody.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Compose Form */}
      <div
        className="p-6 h-full overflow-y-auto"
        style={{ height: 'calc(100vh - 80px)' }}
      >
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* To Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <input
            type="text"
            value={originalEmail.sender.suimailNs}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
        </div>

        {/* Subject Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={replySubject}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
        </div>

        {/* Message Body */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            ref={textareaRef}
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your reply here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSending}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Press Ctrl+Enter to send, Escape to cancel
            </p>
            <p
              className={`text-xs ${replyBody.length > 9000 ? 'text-red-500' : 'text-gray-400'}`}
            >
              {replyBody.length}/10,000 characters
            </p>
          </div>
        </div>

        {/* Original Message Preview */}
        <div className="border-t border-gray-200 pt-4">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 list-none">
              <span className="inline-flex items-center">
                <svg
                  className="h-4 w-4 mr-2 transition-transform group-open:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Show quoted message
              </span>
            </summary>
            <div className="mt-3 p-3 bg-gray-50 border-l-4 border-gray-300 rounded-r-md">
              <div className="text-xs text-gray-600 mb-2">
                <div>
                  <strong>From:</strong> {originalEmail.sender.suimailNs}
                </div>
                <div>
                  <strong>Date:</strong> {formatDate(originalEmail.createdAt)}
                </div>
                <div>
                  <strong>Subject:</strong> {originalEmail.subject}
                </div>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {originalEmail.body.split('\n').map((line, index) => (
                  <div key={index} className="text-gray-600">
                    <span className="text-gray-400 mr-2">{'>'}</span>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
