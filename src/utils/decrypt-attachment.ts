// utils/decrypt-attachment.ts
import {
  SealClient,
  SessionKey,
  NoAccessError,
  EncryptedObject,
} from '@mysten/seal'
import { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { fromHex } from '@mysten/bcs'

const SERVER_OBJECT_IDS: string[] = JSON.parse(
  import.meta.env.VITE_SERVER_OBJECT_IDS || '[]'
)

export interface DecryptedAttachmentContent {
  fileName: string
  fileType: string
  content: string // base64 encoded
}

/**
 * Download encrypted blob from Walrus aggregator
 */
async function downloadBlobFromAggregator(blobId: string): Promise<Uint8Array> {
  const url = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Failed to fetch blob (${response.status})`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}

/**
 * Convert Uint8Array to base64 safely (handles large files)
 */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }

  return btoa(binary)
}

/**
 * Decrypt attachment using Seal session key
 */
export async function decryptAttachment(params: {
  attachmentBlobId: string
  mailObjectId: string
  sessionKey: SessionKey
  suiClient: SuiClient
  packageId: string
}): Promise<DecryptedAttachmentContent> {
  const { attachmentBlobId, mailObjectId, sessionKey, suiClient, packageId } =
    params

  const sealClient = new SealClient({
    suiClient,
    serverConfigs: SERVER_OBJECT_IDS.map((id: string) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  })

  const encryptedBytes = await downloadBlobFromAggregator(attachmentBlobId)

  const encryptedObject = EncryptedObject.parse(encryptedBytes)
  const fullId = encryptedObject.id

  const tx = new Transaction()
  const keyIdArg = tx.pure.vector('u8', fromHex(fullId))

  tx.moveCall({
    target: `${packageId}::messages::seal_approve`,
    arguments: [keyIdArg, tx.object(mailObjectId)],
  })

  const txBytes = await tx.build({
    client: suiClient,
    onlyTransactionKind: true,
  })

  try {
    await sealClient.fetchKeys({
      ids: [fullId],
      txBytes,
      sessionKey,
      threshold: 2,
    })
  } catch (err) {
    if (err instanceof NoAccessError) {
      throw new Error('Not authorized to decrypt this attachment')
    }
    throw err
  }

  const decryptedBytes = await sealClient.decrypt({
    data: encryptedBytes,
    sessionKey,
    txBytes,
  })

  const base64Content = uint8ToBase64(decryptedBytes)

  return {
    fileName: 'attachment',
    fileType: 'application/octet-stream',
    content: base64Content,
  }
}
