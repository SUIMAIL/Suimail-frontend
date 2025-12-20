// utils/mail-encryption.utils.ts
import { SealClient } from '@mysten/seal'
import { Transaction } from '@mysten/sui/transactions'
import { fromHex, toHex } from '@mysten/sui/utils'
import type { SuiClient } from '@mysten/sui/client'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID
const NUM_EPOCHS = 50

const SERVER_OBJECT_IDS: string[] = JSON.parse(
  import.meta.env.VITE_SERVER_OBJECT_IDS || '[]'
)

export type EncryptedAttachment = {
  blobId: string
  fileName: string
  fileType: string
}

export interface CreateMailResult {
  mailObjectId: string
}

export interface EncryptMailResult {
  mailBlobId: string
}

/**
 * Create mail object on-chain
 */
export async function createMailOnChain(
  recipientAddress: string,
  // suiClient: SuiClient,
  signAndExecute: any
): Promise<string> {
  return new Promise((resolve, reject) => {
    const tx = new Transaction()

    tx.moveCall({
      target: `${PACKAGE_ID}::messages::compose_mail`,
      arguments: [tx.pure.address(recipientAddress), tx.object('0x6')],
    })

    tx.setGasBudget(10000000)

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async (result: any) => {
          let mailObject = result.effects?.created?.find(
            (item: any) =>
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
              arguments: [
                tx.pure.string(recipientAddress),
                tx.object(mailObjectId),
              ],
            })
          }

          resolve(mailObjectId || '')
        },
        onError: (error: any) => {
          reject(error)
        },
      }
    )
  })
}

/**
 * Encrypt and upload data to Walrus
 */
async function encryptAndUploadToWalrus(
  data: Uint8Array,
  policyObjectId: string,
  suiClient: SuiClient,
  publisherUrl: string
): Promise<string> {
  const sealClient = new SealClient({
    suiClient,
    serverConfigs: SERVER_OBJECT_IDS.map((id: string) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  })

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
    `${publisherUrl}/v1/blobs?epochs=${NUM_EPOCHS}`,
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
}

/**
 * Encrypt mail content
 */
export async function encryptMailContent(
  subject: string,
  message: string,
  policyObjectId: string,
  suiClient: SuiClient,
  publisherUrl: string
): Promise<string> {
  const mailContent = JSON.stringify({
    subject,
    message,
    timestamp: new Date().toISOString(),
  })

  const encoder = new TextEncoder()
  const dataBytes = encoder.encode(mailContent)

  const blobId = await encryptAndUploadToWalrus(
    dataBytes,
    policyObjectId,
    suiClient,
    publisherUrl
  )

  return blobId
}

/**
 * Encrypt attachments
 */
export async function encryptAttachments(
  attachments: File[],
  policyObjectId: string,
  suiClient: SuiClient,
  publisherUrl: string
): Promise<EncryptedAttachment[]> {
  const results: EncryptedAttachment[] = []

  for (const file of attachments) {
    const arrayBuffer = await file.arrayBuffer()
    const dataBytes = new Uint8Array(arrayBuffer)

    const blobId = await encryptAndUploadToWalrus(
      dataBytes,
      policyObjectId,
      suiClient,
      publisherUrl
    )

    results.push({
      blobId,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
    })
  }

  return results
}
