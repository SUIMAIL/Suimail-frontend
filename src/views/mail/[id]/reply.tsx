import { useState, useEffect, useRef } from 'react'
import { X, Send, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Editor } from '@tinymce/tinymce-react'
import type { IEmail } from '@/types/generic'

interface ReplyComposerProps {
  originalEmail: IEmail
  onSend: (replyData: {
    to: string
    subject: string
    body: string
    inReplyTo?: string
    originalMessageId?: string
  }) => Promise<void>
  onCancel: () => void
  isVisible: boolean
  isSending: boolean
}

export function ReplyComposer({
  originalEmail,
  onSend,
  onCancel,
  isVisible,
  isSending,
}: ReplyComposerProps) {
  const [replyBody, setReplyBody] = useState('')
  const [error, setError] = useState('')
  const [showQuotedMessage, setShowQuotedMessage] = useState(false)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    if (isVisible && editorRef.current) {
      editorRef.current.focus()
    }
  }, [isVisible])

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Generate reply subject (avoid double Re:)
  const replySubject = originalEmail.subject.startsWith('Re: ')
    ? originalEmail.subject
    : `Re: ${originalEmail.subject}`

  const handleSend = async () => {
    const bodyText = editorRef.current?.getContent({ format: 'text' }) || ''
    const bodyHtml = editorRef.current?.getContent() || ''

    if (!bodyText.trim()) {
      setError('Please enter a message')
      return
    }
    if (bodyText.trim().length > 10000) {
      setError('Message is too long (maximum 10,000 characters)')
      return
    }
    setError('')

    try {
      await onSend({
        to: originalEmail.sender.suimailNs || '',
        subject: replySubject,
        body: bodyHtml,
        inReplyTo: originalEmail.id,
        originalMessageId: originalEmail.id,
      })
      setReplyBody('')
      editorRef.current?.setContent('')
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to send reply. Please try again.'
      setError(errorMessage)
      console.error('Reply send error:', err)
    }
  }

  const handleCancel = () => {
    if (!isSending) {
      setReplyBody('')
      setError('')
      editorRef.current?.setContent('')
      onCancel()
    }
  }

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 bg-white border-l border-gray-200 shadow-lg z-30 flex flex-col">
      {/* Simplified Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSending}
            className="h-8 w-8 p-0 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-medium text-gray-900">Reply</h3>
            <p className="text-sm text-gray-500">
              to {originalEmail.sender.suimailNs}
            </p>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={isSending || !replyBody.trim()}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Compose Area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* To and Subject Fields - Simplified */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500 w-16">To:</span>
              <span className="text-gray-900">
                {originalEmail.sender.suimailNs}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500 w-16">Subject:</span>
              <span className="text-gray-900">{replySubject}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            {/* Rich Text Editor */}
            <div className="mb-4">
              <Editor
                onInit={(evt, editor) => (editorRef.current = editor)}
                apiKey="p1c813h59vb782y37f6bpto2sdq5ahef5odr908nox2ra45b"
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    'autolink',
                    'lists',
                    'link',
                    'charmap',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'fullscreen',
                    'insertdatetime',
                    'media',
                    'table',
                    'preview',
                    'help',
                    'wordcount',
                  ],
                  toolbar:
                    'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                  content_style:
                    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; font-size: 14px }',
                  branding: false,
                  resize: false,
                  statusbar: false,
                  placeholder: 'Type your reply here...',
                }}
                onEditorChange={content => setReplyBody(content)}
              />
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="text-xs text-gray-500 mb-4">
              Press Ctrl+Enter to send • Esc to cancel
            </div>

            {/* Quoted Message Toggle */}
            <div className="border-t border-gray-200 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuotedMessage(!showQuotedMessage)}
                className="text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
              >
                <ChevronDown
                  className={`h-4 w-4 mr-2 transition-transform ${showQuotedMessage ? 'rotate-180' : ''}`}
                />
                {showQuotedMessage ? 'Hide' : 'Show'} quoted message
              </Button>

              {showQuotedMessage && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-600 space-y-1 mb-3">
                    <div>
                      <span className="font-medium">From:</span>{' '}
                      {originalEmail.sender.suimailNs}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{' '}
                      {formatDate(originalEmail.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span>{' '}
                      {originalEmail.subject}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap border-l-2 border-gray-300 pl-3">
                    {originalEmail.body}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
