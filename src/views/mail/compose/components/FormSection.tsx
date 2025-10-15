import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Paperclip, Send, X } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from './FormField'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ReturnRequiredFee } from './ReturnRequiredFee'
import {
  useGetActiveUserListStatusQuery,
  useGetUserMailFeeAndAddressQuery,
} from '@/hooks/user'
import { AxiosError } from 'axios'
import { isValidSuimailAddress } from '@/utils/helpers'
import { useQueryClient } from '@tanstack/react-query'
import { calculateTotalAttachmentsSize } from '../helpers/checkers'
import prettyBytes from 'pretty-bytes'

const formSchema = z.object({
  recipient: z.string().refine(value => isValidSuimailAddress(value), {
    message: 'Please enter a valid suimail address (e.g. name@suimailapp)',
  }),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  attachments: z.array(z.instanceof(File)).optional(),
})

export type ComposeFormData = z.infer<typeof formSchema>

interface OnSubmitValues extends ComposeFormData {
  requiredFee: number
  recipientAddress: string
}

interface FormSectionProps {
  onSubmit: (data: OnSubmitValues) => Promise<void>
  isLoading?: boolean
}

export function FormSection({ onSubmit, isLoading }: FormSectionProps) {
  const queryClient = useQueryClient()

  const [recipientIsSet, setRecipientIsSet] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState<string | null>(null)
  const [recipientError, setRecipientError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ComposeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: '',
      subject: '',
      message: '',
      attachments: [],
    },
  })

  const {
    data: mailFeeAndAddressResult,
    isFetching: isFetchingMailFeeAndAddress,
    refetch: refetchMailFeeAndAddress,
    error: mailFeeAndAddressError,
  } = useGetUserMailFeeAndAddressQuery(watch('recipient'), {
    enabled: false,
  })

  const {
    data: senderListedData,
    isFetching: isFetchingSenderListedData,
    refetch: refetchSenderListedData,
  } = useGetActiveUserListStatusQuery(watch('recipient'), {
    enabled: false,
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

  const handleOnSubmit = async (data: ComposeFormData) => {
    if (!recipientAddress) {
      setRecipientError('Recipient not found')
      setTimeout(() => setRecipientError(null), 2000)
      return
    }

    // Call onSubmit (which navigates immediately)
    await onSubmit({
      ...data,
      requiredFee,
      recipientAddress: recipientAddress ?? '',
    })

    // Clear form after navigation
    setValue('recipient', '')
    setValue('subject', '')
    setValue('message', '')
    setValue('attachments', [])
    setRecipientIsSet(false)
    setRecipientAddress(null)
    setRecipientError(null)
  }

  useEffect(() => {
    if (
      mailFeeAndAddressResult &&
      senderListedData &&
      !senderListedData.listedStatus.senderIsBlacklisted
    ) {
      setRecipientAddress(mailFeeAndAddressResult.address)
      setRecipientIsSet(true)
    } else {
      if (senderListedData?.listedStatus.senderIsBlacklisted) {
        setRecipientError('You cannot send mails to this recipient')
        setTimeout(() => setRecipientError(null), 2000)
      }
    }
  }, [mailFeeAndAddressResult, senderListedData, setValue])

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
        setTimeout(() => setRecipientError(null), 2000)
      } else {
        setRecipientError(axiosErrorMessage)
        setTimeout(() => setRecipientError(null), 2000)
      }
    }
  }, [mailFeeAndAddressError])

  const handleClearRecipient = () => {
    const recipient = watch('recipient')

    queryClient.cancelQueries({
      queryKey: ['user-mail-fee-and-address', recipient],
    })

    queryClient.cancelQueries({
      queryKey: ['active-user-list-status', recipient],
    })

    setRecipientIsSet(false)
    setRecipientAddress(null)
    setRecipientError(null)
    setValue('recipient', '')
  }

  const attachmentsDetailsText = () => {
    if (attachments.length === 0) return null

    return `${attachments.length} File${attachments.length > 1 ? 's' : ''} - ${prettyBytes(calculateTotalAttachmentsSize(attachments))}`
  }

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-5">
      <div>
        <FormField
          label="To"
          name="recipient"
          placeholder="e.g. jane@suimailapp"
          error={errors.recipient?.message || recipientError}
          register={register}
          required
          disabled={
            recipientIsSet ||
            isFetchingMailFeeAndAddress ||
            isFetchingSenderListedData
          }
          readonly={recipientIsSet}
          onBlur={() => {
            if (watch('recipient')) {
              if (isValidSuimailAddress(watch('recipient'))) {
                setValue('recipient', watch('recipient'), {
                  shouldValidate: true,
                })
                refetchMailFeeAndAddress()
                refetchSenderListedData()
              } else {
                setValue('recipient', watch('recipient'), {
                  shouldValidate: true,
                  shouldTouch: true,
                })
              }
            }
          }}
          extendAction={
            recipientIsSet && (
              <Button
                type="button"
                variant="link"
                className="absolute top-1/2 -translate-y-1/2 right-2 text-muted-foreground hover:text-foreground"
                onClick={handleClearRecipient}
              >
                <X className="w-4 h-4" />
              </Button>
            )
          }
        />
      </div>

      <ReturnRequiredFee
        isFetching={isFetchingMailFeeAndAddress || isFetchingSenderListedData}
        requiredFee={requiredFee}
      />

      <FormField
        label="Subject"
        name="subject"
        placeholder="What's this about?"
        error={errors.subject?.message}
        register={register}
        required
      />

      <FormField
        label="Message"
        name="message"
        type="textarea"
        placeholder="Write your message here..."
        error={errors.message?.message}
        register={register}
        setValue={setValue}
        watch={watch}
        required
        rows={12}
        useRichEditor={true}
      />

      <div className="space-y-2">
        <Label>Attachments</Label>
        <Input
          type="file"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-base/10 file:text-blue-base hover:file:bg-blue-base/20 transition-colors"
        />
        <div>
          <div className="pl-2">
            <p className="text-xs text-muted-foreground">
              {attachmentsDetailsText()}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center surface-dark elevation-1 px-3 py-1 rounded-full text-sm text-foreground hover:elevation-2 transition-all"
              >
                <Paperclip className="w-4 h-4 mr-1 text-blue-base" />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="ml-2 text-destructive hover:text-destructive/80 transition-colors touch-target"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="submit"
          disabled={
            isLoading ||
            isFetchingMailFeeAndAddress ||
            isFetchingSenderListedData
          }
          className="flex items-center justify-center gap-2 bg-blue-base hover:bg-blue-dark text-white px-5 py-2 rounded-lg font-medium transition-all hover:shadow-hover touch-target"
        >
          <Send className="w-5 h-5" />
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </form>
  )
}
