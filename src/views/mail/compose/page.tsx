import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { usePostSendMailMutation } from '@/hooks/mail'
import { FormSection } from './components/FormSection'
import { useToastContext } from '@/components/ui/toast'
import { useCreateEscrowTx } from './utils/create-escrow-tx'
import {
  checkValidAttachmentSize,
  checkValidTotalAttachmentsSize,
  MAX_ATTACHMENT_SIZE,
  MAX_ATTACHMENTS_TOTAL_SIZE,
} from './helpers/checkers'
import prettyBytes from 'pretty-bytes'
import { AxiosError } from 'axios'
import mixpanel from '@/utils/mixpanel'

interface ComposeMailValues {
  recipient: string
  subject: string
  message: string
  attachments?: File[]
  requiredFee: number
  recipientAddress: string
}

export default function ComposePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setNotification } = useToastContext()

  const { createEscrowTx } = useCreateEscrowTx()
  const { mutateAsync: sendMail, isPending: isSendingMail } =
    usePostSendMailMutation()

  const handleSend = async (data: ComposeMailValues) => {
    try {
      let createEscrowTxDigest = ''

      if (data.requiredFee > 0) {
        createEscrowTxDigest = await createEscrowTx(
          data.requiredFee,
          data.recipientAddress
        )

        if (createEscrowTxDigest === 'false') {
          setNotification({
            message: 'Failed to charge mail Transaction Fee',
            type: 'error',
          })
          mixpanel.track('Send Mail Failure', {
            reason: 'Failed to charge mail Transaction Fee',
          })
          return
        }
      }

      const formData = new FormData()
      formData.append('recipient', data.recipient)
      formData.append('subject', data.subject)
      formData.append('body', data.message)

      if (createEscrowTxDigest.length > 0 && createEscrowTxDigest !== 'false') {
        formData.append('digest', createEscrowTxDigest)
      }

      if (data.attachments) {
        if (checkValidAttachmentSize(data.attachments)) {
          setNotification({
            message: 'Invalid attachment size',
            description: `Attachment must be around ${prettyBytes(
              MAX_ATTACHMENT_SIZE,
              {
                maximumFractionDigits: 0,
              }
            )}`,
            type: 'error',
          })
          mixpanel.track('Send Mail Failure', {
            reason: 'Invalid attachment size',
          })
          return
        }

        if (!checkValidTotalAttachmentsSize(data.attachments)) {
          setNotification({
            message: `Total attachments size is too large. Max ${prettyBytes(
              MAX_ATTACHMENTS_TOTAL_SIZE,
              {
                maximumFractionDigits: 0,
              }
            )}`,
            type: 'error',
          })
          mixpanel.track('Send Mail Failure', {
            reason: 'Total attachments size is too large',
          })
          return
        }
      }

      data.attachments?.forEach(file => formData.append('attachments', file))

      // Navigate to inbox immediately for fast UX
      navigate('/mail/inbox')

      setNotification({
        message: 'Sending mail...',
        type: 'success',
      })

      // Send mail in background
      sendMail(formData)
        .then(async () => {
          setNotification({
            message: 'Mail sent successfully',
            type: 'success',
          })
          mixpanel.track('Send Mail Success', {
            has_attachments: !!data.attachments && data.attachments.length > 0,
            attachment_count: data.attachments?.length || 0,
            has_fee: data.requiredFee > 0,
          })
          await queryClient.invalidateQueries({
            queryKey: ['outbox-mails', 'inbox-mails'],
          })
        })
        .catch(error => {
          if (error instanceof AxiosError) {
            setNotification({
              message: error.response?.data.message || 'Failed to send mail',
              type: 'error',
            })
            mixpanel.track('Send Mail Failure', {
              reason: error.response?.data.message,
            })
          } else {
            setNotification({
              message: 'Failed to send mail',
              type: 'error',
            })
            mixpanel.track('Send Mail Failure', {
              reason: 'Unknown error',
            })
          }
        })
    } catch {
      setNotification({
        message: 'Failed to send mail',
        type: 'error',
      })
      mixpanel.track('Send Mail Failure', {
        reason: 'Failed to send mail',
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen surface-base">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border surface-light elevation-1 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="hover:bg-accent flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">New Message</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <FormSection onSubmit={handleSend} isLoading={isSendingMail} />
        </div>
      </div>
    </div>
  )
}
