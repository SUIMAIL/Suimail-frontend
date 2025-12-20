import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Paperclip, Send, X, Loader2 } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '../compose/components/FormField'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ReturnRequiredFee } from '../compose/components/ReturnRequiredFee'
import {
  useGetActiveUserListStatusQuery,
  useGetUserMailFeeAndAddressQuery,
} from '@/hooks/user'
import { AxiosError } from 'axios'
import prettyBytes from 'pretty-bytes'

const formSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  attachments: z.array(z.instanceof(File)).optional(),
})

export type ReplyFormData = z.infer<typeof formSchema>

interface OnSubmitValues extends ReplyFormData {
  requiredFee: number
  recipientAddress: string
}

interface ReplyFormSectionProps {
  onSubmit: (data: OnSubmitValues) => Promise<void>
  isLoading?: boolean
  parentSubject: string
  recipientEmail: string
}

export function ReplyFormSection({
  onSubmit,
  isLoading,
  parentSubject,
  recipientEmail,
}: ReplyFormSectionProps) {
  const [recipientAddress, setRecipientAddress] = useState<string | null>(null)
  const [recipientError, setRecipientError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReplyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: recipientEmail,
      subject: `Re: ${parentSubject}`,
      message: '',
      attachments: [],
    },
  })

  // Fetch recipient address and mail fee using the same hook as compose
  const {
    data: mailFeeAndAddressResult,
    isFetching: isFetchingMailFeeAndAddress,
    error: mailFeeAndAddressError,
  } = useGetUserMailFeeAndAddressQuery(recipientEmail, {
    enabled: !!recipientEmail,
  })

  const { data: senderListedData, isFetching: isFetchingSenderListedData } =
    useGetActiveUserListStatusQuery(recipientEmail, {
      enabled: !!recipientEmail,
    })

  const requiredFee = useMemo(() => {
    if (
      senderListedData?.listedStatus.senderIsWhitelisted ||
      senderListedData?.listedStatus.senderIsBlacklisted
    ) {
      return 0
    }

    if (mailFeeAndAddressResult) {
      return mailFeeAndAddressResult.mailFee
    }

    return 0
  }, [mailFeeAndAddressResult, senderListedData])

  const attachments = watch('attachments') || []
  const isValidating = isFetchingMailFeeAndAddress || isFetchingSenderListedData

  // Set recipient address when data is fetched
  useEffect(() => {
    if (
      mailFeeAndAddressResult &&
      senderListedData &&
      !senderListedData.listedStatus.senderIsBlacklisted
    ) {
      setRecipientAddress(mailFeeAndAddressResult.address)
      setRecipientError(null)
    } else if (senderListedData?.listedStatus.senderIsBlacklisted) {
      setRecipientError('You cannot send mails to this recipient')
      setTimeout(() => setRecipientError(null), 2000)
    }
  }, [mailFeeAndAddressResult, senderListedData])

  // Handle API errors
  useEffect(() => {
    if (
      mailFeeAndAddressError &&
      mailFeeAndAddressError instanceof AxiosError
    ) {
      const axiosErrorMessage = (
        mailFeeAndAddressError.response?.data as { message: string }
      ).message

      if (axiosErrorMessage === 'User not found') {
        setRecipientError('Recipient not found')
      } else {
        setRecipientError(axiosErrorMessage)
      }
      setTimeout(() => setRecipientError(null), 2000)
    }
  }, [mailFeeAndAddressError])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setValue('attachments', [...attachments, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setValue(
      'attachments',
      attachments.filter((_, i) => i !== index)
    )
  }

  const handleOnSubmit = async (data: ReplyFormData) => {
    if (!recipientAddress) {
      setRecipientError('Recipient address not found')
      setTimeout(() => setRecipientError(null), 2000)
      return
    }

    await onSubmit({
      ...data,
      requiredFee,
      recipientAddress: recipientAddress,
    })

    // Reset form after successful submission
    setValue('subject', `Re: ${parentSubject}`)
    setValue('message', '')
    setValue('attachments', [])
  }

  return (
    <div className="surface-base elevation-1 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="surface-dark px-6 py-4 border-b border-border flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          Reply to {recipientEmail}
        </h2>
        {isValidating && (
          <Loader2 className="w-4 h-4 animate-spin text-blue-base ml-auto" />
        )}
      </div>

      <form onSubmit={handleSubmit(handleOnSubmit)} className="p-6 space-y-6">
        {/* Recipient - Read Only */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">To</Label>
          <div className="px-3 py-2 bg-surface-light border border-border rounded-lg text-foreground">
            {recipientEmail}
          </div>
          {recipientError && (
            <p className="text-xs text-destructive">{recipientError}</p>
          )}

          <ReturnRequiredFee
            isFetching={isValidating}
            requiredFee={requiredFee}
          />
        </div>

        {/* Subject */}
        <FormField
          label="Subject"
          name="subject"
          placeholder="Subject"
          error={errors.subject?.message}
          register={register}
          required
        />

        {/* Message */}
        <FormField
          label="Message"
          name="message"
          type="textarea"
          placeholder="Write your reply..."
          error={errors.message?.message}
          register={register}
          setValue={setValue}
          watch={watch}
          required
          rows={12}
          useRichEditor={true}
        />

        {/* Attachments */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Attachments
          </Label>

          <Input
            type="file"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-base/10 file:text-blue-base hover:file:bg-blue-base/20 file:cursor-pointer"
          />

          {attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="email-card flex items-center justify-between px-3 py-2 group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {prettyBytes(file.size)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isLoading || isValidating || !recipientAddress}
            className="btn-primary gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reply
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
