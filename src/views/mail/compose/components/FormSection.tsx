import type React from 'react'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Paperclip, Send, X, Loader2, Mail, Trash2, Save } from 'lucide-react'
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
import prettyBytes from 'pretty-bytes'
import { useDraftContext } from '@/utils/contexts/DraftContext'
import {
  useSaveDraftMutation,
  useFetchDraftQuery,
  useDeleteDraftMutation,
} from '@/hooks/mail'
import { DraftAutoSaveIndicator } from '@/components/DraftAutoSaveIndicator'
import {
  encryptAndUploadDraft,
  downloadAndDecryptDraft,
} from '@/utils/draft-helpers'
import { useCurrentWallet } from '@mysten/dapp-kit'

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
  draftId?: string
}

export function FormSection({
  onSubmit,
  isLoading,
  draftId,
}: FormSectionProps) {
  const queryClient = useQueryClient()
  const { currentWallet } = useCurrentWallet()
  const userAddress = currentWallet?.accounts[0]?.address

  const [recipientIsSet, setRecipientIsSet] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState<string | null>(null)
  const [recipientError, setRecipientError] = useState<string | null>(null)

  const {
    isSaving,
    setIsSaving,
    setSaveError,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    currentDraftId,
    setCurrentDraftId,
  } = useDraftContext()

  const [draftCache, setDraftCache] = useState<{
    recipient: string
    subject: string
    message: string
  } | null>(null)
  const [lastSavedAtLocal, setLastSavedAtLocal] = useState<Date | null>(null)

  const { mutateAsync: saveDraft } = useSaveDraftMutation()
  const { mutateAsync: deleteDraft } = useDeleteDraftMutation()
  const { data: fetchedDraftData, isFetching: isFetchingDraft } =
    useFetchDraftQuery(draftId || '')

  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const latestValuesRef = useRef({ recipient: '', subject: '', message: '' })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
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
  const isValidating = isFetchingMailFeeAndAddress || isFetchingSenderListedData

  // Track all form changes
  useEffect(() => {
    const subscription = watch(() => {
      setHasUnsavedChanges(true)
    })
    return () => subscription.unsubscribe()
  }, [watch, setHasUnsavedChanges])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setValue('attachments', [...attachments, ...newFiles])
      setHasUnsavedChanges(true)
    }
  }

  const removeAttachment = (index: number) => {
    setValue(
      'attachments',
      attachments.filter((_, i) => i !== index)
    )
    setHasUnsavedChanges(true)
  }

  useEffect(() => {
    if (draftId && fetchedDraftData?.draft && !isFetchingDraft && userAddress) {
      const loadDraft = async () => {
        try {
          const walrusBlobId = fetchedDraftData.draft.walrusBlobId

          let content
          if (walrusBlobId) {
            content = await downloadAndDecryptDraft({
              blobId: walrusBlobId,
              userAddress,
            })
          } else if (fetchedDraftData.draft.encryptedContent) {
            setSaveError(
              'This draft uses old format. Please save it again to migrate to Walrus.'
            )
            return
          } else {
            throw new Error('Draft has no content')
          }

          setValue('recipient', fetchedDraftData.draft.recipientId || '')
          setValue('subject', content.subject)
          setValue('message', content.message)

          setCurrentDraftId(draftId)
          setHasUnsavedChanges(false)
        } catch (error) {
          console.error('Failed to decrypt draft:', error)
          setSaveError('Failed to load draft. You may not have access.')
        }
      }
      loadDraft()
    }
  }, [
    draftId,
    fetchedDraftData,
    isFetchingDraft,
    userAddress,
    setCurrentDraftId,
    setHasUnsavedChanges,
    setSaveError,
    setValue,
  ])

  const handleAutoSave = useCallback(
    async (recipient: string, subject: string, message: string) => {
      // Check if wallet is connected
      if (!userAddress) {
        console.error('No wallet connected for auto-save')
        setSaveError('Please connect your wallet to save drafts')
        return
      }

      setIsSaving(true)
      setSaveError(null)

      try {
        // Generate or use existing draft ID
        const activeDraftId =
          currentDraftId ||
          `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Get Walrus publisher URL from environment
        const publisherUrl =
          import.meta.env.VITE_WALRUS_PUBLISHER_URL ||
          'https://walrus.testnet.publisher.stakepool.dev.br'

        // Encrypt and upload to Walrus
        const walrusBlobId = await encryptAndUploadDraft({
          subject,
          message,
          draftId: activeDraftId,
          userAddress,
          publisherUrl,
        })

        const payload: any = {
          walrusBlobId, // Changed from encryptedContent to walrusBlobId
        }

        // Only include recipientId if provided and not empty
        if (recipient && recipient.trim()) {
          payload.recipientId = recipient
        }

        // Include draftId if editing an existing draft
        if (currentDraftId) {
          payload.draftId = currentDraftId
        }

        const result = await saveDraft(payload)
        setDraftCache({ recipient, subject, message })
        setLastSavedAtLocal(new Date())

        // Set draft ID if this is a new draft
        if (!currentDraftId && result?.draftId) {
          setCurrentDraftId(result.draftId)
        }

        await queryClient.invalidateQueries({
          queryKey: ['drafts-mails'],
        })

        setHasUnsavedChanges(false)
      } catch (error: any) {
        console.error('Auto-save failed:', error)

        if (error.response?.status === 401) {
          setSaveError('Authentication required')
        } else if (error.message?.includes('Walrus')) {
          setSaveError('Failed to upload to Walrus storage')
        } else {
          setSaveError('Failed to save encrypted draft')
        }
      } finally {
        setIsSaving(false)
      }
    },
    [
      saveDraft,
      setIsSaving,
      setSaveError,
      setHasUnsavedChanges,
      queryClient,
      currentDraftId,
      setCurrentDraftId,
      userAddress,
    ]
  )

  // Auto-save draft every 10 seconds
  useEffect(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current)
    }

    // Subscribe to form changes
    const subscription = watch(data => {
      latestValuesRef.current = {
        recipient: data.recipient || '',
        subject: data.subject || '',
        message: data.message || '',
      }
    })

    autoSaveIntervalRef.current = setInterval(async () => {
      const { recipient, subject, message } = latestValuesRef.current

      if (hasUnsavedChanges && recipient && (subject || message)) {
        await handleAutoSave(recipient, subject, message)
      }
    }, 10000)

    return () => {
      subscription.unsubscribe()
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current)
      }
    }
  }, [hasUnsavedChanges, handleAutoSave, watch])

  const handleOnSubmit = async (data: ComposeFormData) => {
    if (!recipientAddress) {
      setRecipientError('Recipient not found')
      setTimeout(() => setRecipientError(null), 2000)
      return
    }

    await onSubmit({
      ...data,
      requiredFee,
      recipientAddress: recipientAddress ?? '',
    })

    // Clear draft after successful send
    if (currentDraftId) {
      try {
        await deleteDraft(currentDraftId)
        await queryClient.invalidateQueries({
          predicate: query => query.queryKey[0] === 'drafts-mails',
        })
      } catch (error) {
        console.error('Failed to delete draft after send:', error)
      }
    }

    reset()
    setRecipientIsSet(false)
    setRecipientAddress(null)
    setRecipientError(null)
    setCurrentDraftId(null)
    setHasUnsavedChanges(false)
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

  // Show toast notification when navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && (draftCache?.subject || draftCache?.message)) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    if (hasUnsavedChanges && draftCache) {
      window.addEventListener('beforeunload', handleBeforeUnload)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [hasUnsavedChanges, draftCache])

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
    setHasUnsavedChanges(true)
  }

  // Track changes
  useEffect(() => {
    if (draftId) {
      const subscription = watch(() => {
        setHasUnsavedChanges(true)
      })
      return () => subscription.unsubscribe()
    }
  }, [watch, draftId, setHasUnsavedChanges])

  const handleManualSaveDraft = async () => {
    const recipient = watch('recipient')
    const subject = watch('subject')
    const message = watch('message')

    if (!recipient) {
      setSaveError('Please enter a recipient')
      setTimeout(() => setSaveError(null), 3000)
      return
    }

    if (!userAddress) {
      setSaveError('Please connect your wallet to save drafts')
      setTimeout(() => setSaveError(null), 3000)
      return
    }

    await handleAutoSave(recipient, subject, message)
  }

  return (
    <div className="surface-base elevation-1 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="surface-dark px-6 py-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-blue-base" />
          <h2 className="text-lg font-semibold text-foreground">
            {currentDraftId ? 'Edit Draft' : 'New Message'}
          </h2>
        </div>
        <DraftAutoSaveIndicator lastSavedAt={lastSavedAtLocal} />
      </div>

      <form onSubmit={handleSubmit(handleOnSubmit)} className="p-6 space-y-6">
        {/* Recipient */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-foreground">To</Label>
            {isValidating && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-base" />
            )}
          </div>

          <div className="relative">
            <FormField
              name="recipient"
              label=""
              placeholder="recipient@suimailapp"
              error={errors.recipient?.message || recipientError}
              register={register}
              required
              disabled={recipientIsSet || isValidating}
              readonly={recipientIsSet}
              className="pr-10"
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
            />

            {recipientIsSet && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-1/2 -translate-y-1/2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={handleClearRecipient}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <ReturnRequiredFee
            isFetching={
              isFetchingMailFeeAndAddress || isFetchingSenderListedData
            }
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
          onChange={() => setHasUnsavedChanges(true)}
        />

        {/* Message */}
        <FormField
          label="Message"
          name="message"
          type="textarea"
          placeholder="Write your message..."
          error={errors.message?.message}
          register={register}
          setValue={setValue}
          watch={watch}
          required
          rows={12}
          useRichEditor={true}
          onChange={() => setHasUnsavedChanges(true)}
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
        <div className="flex justify-end gap-3 pt-2">
          {currentDraftId && (
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  await deleteDraft(currentDraftId)
                  await queryClient.invalidateQueries({
                    predicate: query => query.queryKey[0] === 'drafts-mails',
                  })
                  reset()
                  setCurrentDraftId(null)
                  setHasUnsavedChanges(false)
                } catch {
                  setSaveError('Failed to delete draft')
                }
              }}
              disabled={isLoading || isSaving}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Draft
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleManualSaveDraft}
            disabled={isLoading || isSaving || !userAddress}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Draft
              </>
            )}
          </Button>
          <Button
            type="submit"
            disabled={
              isLoading ||
              isFetchingMailFeeAndAddress ||
              isFetchingSenderListedData
            }
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
                Send
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
