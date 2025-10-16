import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Editor } from '@tinymce/tinymce-react'
import type { Editor as TinyMCEEditor } from 'tinymce'
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
  const editorRef = useRef<TinyMCEEditor | null>(null)

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

  const handleSend = useCallback(async () => {
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
  }, [originalEmail, onSend, replySubject])

  const handleCancel = useCallback(() => {
    if (!isSending) {
      setReplyBody('')
      setError('')
      editorRef.current?.setContent('')
      onCancel()
    }
  }, [isSending, onCancel])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return

      if (e.key === 'Escape' && !isSending) {
        handleCancel()
      }

      if (e.ctrlKey && e.key === 'Enter' && !isSending && replyBody.trim()) {
        handleSend()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, isSending, replyBody, handleCancel, handleSend])

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 surface-light border-l border-border elevation-3 z-30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border surface-dark">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSending}
            className="h-8 w-8 p-0 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-semibold text-foreground">Reply</h3>
            <p className="text-sm text-muted-foreground">
              to {originalEmail.sender.suimailNs}
            </p>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={isSending || !replyBody.trim()}
          size="sm"
          className="bg-blue-base hover:bg-blue-dark text-white touch-target"
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
          <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Compose Area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto smooth-scroll">
          {/* To and Subject Fields */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground w-16">To:</span>
              <span className="text-foreground">
                {originalEmail.sender.suimailNs}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground w-16">Subject:</span>
              <span className="text-foreground">{replySubject}</span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            {/* Rich Text Editor */}
            <div className="mb-4 rounded-lg overflow-hidden border border-border">
              <Editor
                onInit={(_evt, editor) => (editorRef.current = editor)}
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
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
                    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; font-size: 14px; color: #1f2937; } body.dark { color: #f9fafb; }',
                  branding: false,
                  resize: false,
                  statusbar: false,
                  placeholder: 'Type your reply here...',
                  skin: 'oxide',
                }}
                onEditorChange={content => setReplyBody(content)}
              />
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="text-xs text-muted-foreground mb-4">
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono text-xs">
                Ctrl+Enter
              </kbd>{' '}
              to send •{' '}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono text-xs">
                Esc
              </kbd>{' '}
              to cancel
            </div>

            {/* Quoted Message Toggle */}
            <div className="border-t border-border pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuotedMessage(!showQuotedMessage)}
                className="text-muted-foreground hover:text-foreground p-0 h-auto font-normal"
              >
                <ChevronDown
                  className={`h-4 w-4 mr-2 transition-transform ${showQuotedMessage ? 'rotate-180' : ''}`}
                />
                {showQuotedMessage ? 'Hide' : 'Show'} quoted message
              </Button>

              {showQuotedMessage && (
                <div className="mt-3 p-4 surface-dark rounded-lg border border-border elevation-1">
                  <div className="text-xs text-muted-foreground space-y-1 mb-3">
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
                  <div className="text-sm text-foreground whitespace-pre-wrap border-l-2 border-border pl-3">
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
