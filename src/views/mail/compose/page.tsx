import { useState } from 'react'
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
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { SealClient } from '@mysten/seal'
import { fromHex, toHex } from '@mysten/sui/utils'
// import { useCurrentWallet } from '@mysten/dapp-kit'
// import { string } from 'zod'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID
const NUM_EPOCHS = 1

const SERVER_OBJECT_IDS = [
  '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
  '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
]

interface ComposeMailValues {
  recipient: string
  subject: string
  message: string
  attachments?: File[]
  requiredFee: number
  recipientAddress: string
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

export default function ComposePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setNotification } = useToastContext()
  const suiClient = useSuiClient()
  const [selectedWalrusService, setSelectedWalrusService] = useState('service1')

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
    serverConfigs: SERVER_OBJECT_IDS.map(id => ({
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

      console.log('Encrypting data with ID:', id)

      const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
        threshold: 2,
        packageId: PACKAGE_ID,
        id,
        data,
      })

      console.log('Data encrypted, uploading to Walrus...')

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
      console.log('Walrus upload result:', result)

      let blobId: string
      if ('alreadyCertified' in result) {
        blobId = result.alreadyCertified.blobId
      } else if ('newlyCreated' in result) {
        blobId = result.newlyCreated.blobObject.blobId
      } else {
        throw new Error('Unexpected Walrus response format')
      }

      console.log('Blob ID:', blobId)
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

    console.log('Encrypting mail content...')
    const blobId = await encryptAndUploadToWalrus(dataBytes, policyObjectId)
    console.log('Mail content encrypted and uploaded, Blob ID:', blobId)

    return blobId
  }

  const encryptAttachments = async (
    attachments: File[],
    policyObjectId: string
  ): Promise<string[]> => {
    const blobIds: string[] = []

    for (const file of attachments) {
      console.log(`Encrypting attachment: ${file.name}`)

      const arrayBuffer = await file.arrayBuffer()
      const dataBytes = new Uint8Array(arrayBuffer)

      const blobId = await encryptAndUploadToWalrus(dataBytes, policyObjectId)
      blobIds.push(blobId)

      console.log(`Attachment ${file.name} encrypted, Blob ID: ${blobId}`)
    }

    return blobIds
  }

  const createMail = async (
    recipient: string
    // mailBlobId: string,
    // attachmentBlobIds: string[]
  ): Promise<string | null> => {
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
            console.log('Mail created on-chain successfully:', result)
            console.log('Transaction effects:', result.effects)
            console.log('Created objects:', result.effects?.created)

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
              console.log('No shared object found, using first created object')
              mailObject = result.effects.created[0]
            }

            const mailObjectId = mailObject?.reference?.objectId

            console.log('Mail object found:', mailObject)
            console.log('Object ownership:', mailObject?.owner)

            if (mailObjectId) {
              console.log('Mail object ID (Policy Object ID):', mailObjectId)
              tx.moveCall({
                target: `${PACKAGE_ID}::messages::add_recipient`,
                arguments: [tx.pure.string(recipient), tx.object(mailObjectId)],
              })
              console.log('Added recipient to mail object on-chain')
            } else {
              console.error('No object ID found in transaction result')
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

  const handleSend = async (data: ComposeMailValues) => {
    try {
      console.log('=== Starting Mail Send Process ===')
      console.log('Recipient:', data.recipient)
      console.log('Recipient Address:', data.recipientAddress)
      console.log('Subject:', data.subject)
      console.log('Has attachments:', !!data.attachments?.length)

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

      setNotification({
        message: 'Creating mail on blockchain...',
        type: 'success',
      })

      let mailObjectId: string | null
      try {
        mailObjectId = await createMail(data.recipientAddress)

        if (!mailObjectId) {
          throw new Error('Failed to get mail object ID from transaction')
        }

        console.log('Using mail object ID as policy object ID:', mailObjectId)
      } catch (error) {
        console.error('Failed to create mail on-chain:', error)
        setNotification({
          message: 'Failed to create mail on blockchain',
          type: 'error',
        })
        mixpanel.track('Send Mail Failure', {
          reason: 'Failed to create mail on-chain',
        })
        return
      }

      const policyObjectId = mailObjectId

      setNotification({
        message: 'Encrypting mail content...',
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
        mixpanel.track('Send Mail Failure', {
          reason: 'Failed to encrypt mail content',
        })
        return
      }

      let attachmentBlobIds: string[] = []
      if (data.attachments && data.attachments.length > 0) {
        setNotification({
          message: 'Encrypting attachments...',
          type: 'success',
        })

        try {
          attachmentBlobIds = await encryptAttachments(
            data.attachments,
            policyObjectId
          )
        } catch (error) {
          console.error('Failed to encrypt attachments:', error)
          setNotification({
            message: 'Failed to encrypt attachments',
            type: 'error',
          })
          mixpanel.track('Send Mail Failure', {
            reason: 'Failed to encrypt attachments',
          })
          return
        }
      }

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
      formData.append('mailBlobId', mailBlobId)
      formData.append('mailObjectId', mailObjectId)

      if (attachmentBlobIds.length > 0) {
        formData.append('attachmentBlobIds', JSON.stringify(attachmentBlobIds))
      }

      if (createEscrowTxDigest.length > 0 && createEscrowTxDigest !== 'false') {
        formData.append('digest', createEscrowTxDigest)
      }

      navigate('/mail/inbox')

      setNotification({
        message: 'Sending mail...',
        type: 'success',
      })

      sendMail(formData)
        .then(async () => {
          setNotification({
            message: 'Mail sent successfully',
            type: 'success',
          })
          mixpanel.track('Send Mail Success', {
            has_attachments: attachmentBlobIds.length > 0,
            attachment_count: attachmentBlobIds.length,
            has_fee: data.requiredFee > 0,
            on_chain: true,
            encrypted: true,
            walrus_storage: true,
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
    } catch (error) {
      console.error('Error in handleSend:', error)
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
              Your mail content and attachments will be encrypted and stored on
              Walrus decentralized storage
            </p>
          </div>

          <FormSection onSubmit={handleSend} isLoading={isSendingMail} />
        </div>
      </div>
    </div>
  )
}
