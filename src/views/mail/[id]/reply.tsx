import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { usePostSendMailMutation } from '@/hooks/mail'
import { ReplyFormSection } from './ReplyFormSection'
import { useToastContext } from '@/components/ui/toast'
import { useCreateEscrowTx } from '../compose/utils/create-escrow-tx'
import {
  checkValidAttachmentSize,
  checkValidTotalAttachmentsSize,
  MAX_ATTACHMENT_SIZE,
  MAX_ATTACHMENTS_TOTAL_SIZE,
} from '../compose/helpers/checkers'
import prettyBytes from 'pretty-bytes'
import { AxiosError } from 'axios'
import mixpanel from '@/utils/mixpanel'
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { SealClient } from '@mysten/seal'
import { fromHex, toHex } from '@mysten/sui/utils'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID
const NUM_EPOCHS = 50

const SERVER_OBJECT_IDS: string[] = JSON.parse(
  import.meta.env.VITE_SERVER_OBJECT_IDS || '[]'
)
interface ReplyMailValues {
  recipient: string
  subject: string
  message: string
  attachments?: File[]
  requiredFee: number
  recipientAddress: string
}

interface ParentMailData {
  mailObjectId: string
  sender: {
    suimailNs: string
    imageUrl?: string
  }
  subject: string
  messagePreview: string
}

type WalrusService = {
  id: string
  name: string
  publisherUrl: string
  aggregatorUrl: string
}

const WALRUS_SERVICES: WalrusService[] = [
  {
    id: 'service1',
    name: 'staketab',
    publisherUrl: 'https://walrus.testnet.publisher.stakepool.dev.br',
    aggregatorUrl:
      'https://wal-aggregator-testnet.staketab.org/v1/blobs/${blobId}',
  },
  {
    id: 'service2',
    name: 'walrus space',
    publisherUrl: '/publisher2',
    aggregatorUrl: '/aggregator2',
  },
  {
    id: 'service3',
    name: 'redundex.com',
    publisherUrl: '/publisher3',
    aggregatorUrl: '/aggregator3',
  },
]

export default function ReplyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { setNotification } = useToastContext()
  const suiClient = useSuiClient()
  const [selectedWalrusService, setSelectedWalrusService] = useState('service1')

  // Get parent mail data from navigation state
  const parentMail = location.state?.parentMail as ParentMailData | undefined

  useEffect(() => {
    if (!parentMail) {
      setNotification({
        message: 'No parent mail found',
        type: 'error',
      })
      navigate('/mail/inbox')
    }
  }, [parentMail, navigate, setNotification])

  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
        },
      }),
  })

  const { createEscrowTx } = useCreateEscrowTx()
  const { mutateAsync: sendMail, isPending: isSendingMail } =
    usePostSendMailMutation()

  const sealClient = new SealClient({
    suiClient,
    serverConfigs: SERVER_OBJECT_IDS.map((id: string) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  })

  const getPublisherUrl = (path: string): string => {
    const service = WALRUS_SERVICES.find(s => s.id === selectedWalrusService)
    const cleanPath = path.replace(/^\/+/, '').replace(/^v1\//, '')
    return `${service?.publisherUrl}/v1/${cleanPath}`
  }

  const encryptAndUploadToWalrus = async (
    data: Uint8Array,
    policyObjectId: string
  ): Promise<string> => {
    try {
      const nonce = crypto.getRandomValues(new Uint8Array(5))
      const policyObjectBytes = fromHex(policyObjectId)
      const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]))

      const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
        threshold: 2,
        packageId: PACKAGE_ID,
        id,
        data,
      })

      const response = await fetch(
        `${getPublisherUrl(`/v1/blobs?epochs=${NUM_EPOCHS}`)}`,
        {
          method: 'PUT',
          body: encryptedBytes,
        }
      )

      if (response.status !== 200) {
        throw new Error('Failed to upload to Walrus')
      }

      const result = await response.json()

      let blobId: string
      if ('alreadyCertified' in result) {
        blobId = result.alreadyCertified.blobId
      } else if ('newlyCreated' in result) {
        blobId = result.newlyCreated.blobObject.blobId
      } else {
        throw new Error('Unexpected Walrus response format')
      }

      return blobId
    } catch (error) {
      console.error('Walrus upload error:', error)
      throw error
    }
  }

  const encryptMailContent = async (
    subject: string,
    message: string,
    policyObjectId: string
  ): Promise<string> => {
    const mailContent = JSON.stringify({
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    const encoder = new TextEncoder()
    const dataBytes = encoder.encode(mailContent)

    const blobId = await encryptAndUploadToWalrus(dataBytes, policyObjectId)

    return blobId
  }

  type EncryptedAttachmentMeta = {
    blobId: string
    fileName: string
    fileType: string
  }

  const encryptAttachments = async (
    attachments: File[],
    policyObjectId: string
  ): Promise<EncryptedAttachmentMeta[]> => {
    const results: EncryptedAttachmentMeta[] = []

    for (const file of attachments) {
      const arrayBuffer = await file.arrayBuffer()
      const dataBytes = new Uint8Array(arrayBuffer)

      const blobId = await encryptAndUploadToWalrus(dataBytes, policyObjectId)

      results.push({
        blobId,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
      })
    }

    return results
  }

  // Create mail on blockchain
  const createMail = async (recipient: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const tx = new Transaction()

      tx.moveCall({
        target: `${PACKAGE_ID}::messages::compose_mail`,
        arguments: [tx.pure.address(recipient), tx.object('0x6')],
      })

      tx.setGasBudget(10000000)

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async result => {
            let mailObject = result.effects?.created?.find(
              item =>
                item.owner &&
                typeof item.owner === 'object' &&
                'Shared' in item.owner
            )

            if (
              !mailObject &&
              result.effects?.created &&
              result.effects.created.length > 0
            ) {
              mailObject = result.effects.created[0]
            }

            const mailObjectId = mailObject?.reference?.objectId

            if (mailObjectId) {
              tx.moveCall({
                target: `${PACKAGE_ID}::messages::add_recipient`,
                arguments: [tx.pure.string(recipient), tx.object(mailObjectId)],
              })
            }

            resolve(mailObjectId || null)
          },
          onError: error => {
            console.error('Failed to create mail on-chain:', error)
            reject(error)
          },
        }
      )
    })
  }

  const handleReply = async (data: ReplyMailValues) => {
    if (!parentMail) {
      setNotification({
        message: 'No parent mail found',
        type: 'error',
      })
      return
    }

    try {
      // Validate attachments
      if (data.attachments && data.attachments.length > 0) {
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
          mixpanel.track('Send Reply Failure', {
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
          mixpanel.track('Send Reply Failure', {
            reason: 'Total attachments size is too large',
          })
          return
        }
      }

      setNotification({
        message: 'Creating reply on blockchain...',
        type: 'success',
      })

      // Create mail on-chain
      let mailObjectId: string | null
      try {
        mailObjectId = await createMail(data.recipientAddress)

        if (!mailObjectId) {
          throw new Error('Failed to get mail object ID from transaction')
        }
      } catch (error) {
        console.error('Failed to create mail on-chain:', error)
        setNotification({
          message: 'Failed to create mail on blockchain',
          type: 'error',
        })
        mixpanel.track('Send Reply Failure', {
          reason: 'Failed to create mail on-chain',
        })
        return
      }

      const policyObjectId = mailObjectId

      // Encrypt mail content
      setNotification({
        message: 'Encrypting reply content...',
        type: 'success',
      })

      let mailBlobId: string
      try {
        mailBlobId = await encryptMailContent(
          data.subject,
          data.message,
          policyObjectId
        )
      } catch (error) {
        console.error('Failed to encrypt mail content:', error)
        setNotification({
          message: 'Failed to encrypt mail content',
          type: 'error',
        })
        mixpanel.track('Send Reply Failure', {
          reason: 'Failed to encrypt mail content',
        })
        return
      }

      // Encrypt attachments if any
      let encryptedAttachments: EncryptedAttachmentMeta[] = []

      if (data.attachments && data.attachments.length > 0) {
        setNotification({
          message: 'Encrypting attachments...',
          type: 'success',
        })

        try {
          encryptedAttachments = await encryptAttachments(
            data.attachments,
            policyObjectId
          )
        } catch (error) {
          console.error('Failed to encrypt attachments:', error)
          setNotification({
            message: 'Failed to encrypt attachments',
            type: 'error',
          })
          mixpanel.track('Send Reply Failure', {
            reason: 'Failed to encrypt attachments',
          })
          return
        }
      }

      // Create escrow transaction if fee required
      let createEscrowTxDigest = ''
      if (data.requiredFee > 0) {
        setNotification({
          message: 'Processing payment...',
          type: 'success',
        })

        createEscrowTxDigest = await createEscrowTx(
          data.requiredFee,
          data.recipientAddress
        )

        if (createEscrowTxDigest === 'false') {
          setNotification({
            message: 'Failed to charge mail Transaction Fee',
            type: 'error',
          })
          mixpanel.track('Send Reply Failure', {
            reason: 'Failed to charge mail Transaction Fee',
          })
          return
        }
      }

      // Prepare payload with reply metadata
      const payload = {
        recipient: data.recipient,
        subject: data.subject,
        mailBlobId,
        mailObjectId,
        parentMailId: parentMail.mailObjectId,
        isReply: true,
        attachments: encryptedAttachments,
        escrowDigest:
          createEscrowTxDigest.length > 0 && createEscrowTxDigest !== 'false'
            ? createEscrowTxDigest
            : undefined,
      }

      navigate('/mail/inbox')

      setNotification({
        message: 'Sending reply...',
        type: 'success',
      })

      // Send the reply
      sendMail(payload)
        .then(async () => {
          setNotification({
            message: 'Reply sent successfully',
            type: 'success',
          })
          mixpanel.track('Send Reply Success', {
            has_attachments: encryptedAttachments.length > 0,
            attachment_count: encryptedAttachments.length,
            has_fee: data.requiredFee > 0,
            on_chain: true,
            encrypted: true,
            walrus_storage: true,
            is_reply: true,
          })
          await queryClient.invalidateQueries({
            queryKey: ['outbox-mails', 'inbox-mails'],
          })
        })
        .catch(error => {
          if (error instanceof AxiosError) {
            setNotification({
              message: error.response?.data.message || 'Failed to send reply',
              type: 'error',
            })
            mixpanel.track('Send Reply Failure', {
              reason: error.response?.data.message,
            })
          } else {
            setNotification({
              message: 'Failed to send reply',
              type: 'error',
            })
            mixpanel.track('Send Reply Failure', {
              reason: 'Unknown error',
            })
          }
        })
    } catch (error) {
      console.error('Error in handleReply:', error)
      setNotification({
        message: 'Failed to send reply',
        type: 'error',
      })
      mixpanel.track('Send Reply Failure', {
        reason: 'Failed to send reply',
      })
    }
  }

  if (!parentMail) {
    return null
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
        <h1 className="text-lg font-semibold text-foreground">Reply</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Original Message Context */}
          <div className="mb-6 p-4 border-l-4 border-accent bg-surface-light rounded-lg">
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                <span className="font-medium">From:</span>{' '}
                {parentMail.sender.suimailNs}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Subject:</span>{' '}
                {parentMail.subject}
              </p>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {parentMail.messagePreview}
                </p>
              </div>
            </div>
          </div>

          {/* Walrus Service Selector */}
          <div className="mb-4 p-4 bg-surface-light rounded-lg border border-border">
            <label className="block text-sm font-medium text-foreground mb-2">
              Walrus Storage Service
            </label>
            <select
              value={selectedWalrusService}
              onChange={e => setSelectedWalrusService(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-surface-base text-foreground"
            >
              {WALRUS_SERVICES.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">
              Your reply content and attachments will be encrypted and stored on
              Walrus decentralized storage
            </p>
          </div>

          {/* Reply Form */}
          <ReplyFormSection
            onSubmit={handleReply}
            isLoading={isSendingMail}
            parentSubject={parentMail.subject}
            recipientEmail={parentMail.sender.suimailNs}
          />
        </div>
      </div>
    </div>
  )
}
