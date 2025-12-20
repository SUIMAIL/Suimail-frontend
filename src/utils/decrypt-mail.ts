// utils/decrypt-mail.ts
import {
  SealClient,
  SessionKey,
  NoAccessError,
  EncryptedObject,
} from '@mysten/seal'
import { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { fromHex } from '@mysten/bcs'

const SERVER_OBJECT_IDS = [
  '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
  '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
]

export interface DecryptedMailContent {
  subject: string
  message: string
  timestamp: string
}

/**
 * Download blob from aggregator and return as Uint8Array
 */
async function downloadBlobFromAggregator(blobId: string): Promise<Uint8Array> {
  const url = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Failed to fetch blob, status ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const json = await response.json()
      if (!json.data) throw new Error('Blob JSON missing data field')
      // Decode base64 to Uint8Array
      return Uint8Array.from(atob(json.data), c => c.charCodeAt(0))
    }

    // Raw bytes
    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    console.error('❌ Failed to download blob:', error)
    throw new Error('Failed to download encrypted content from aggregator')
  }
}

/**
 * Decrypt mail content using Seal
 */
export async function decryptMailContent(params: {
  mailBlobId: string
  mailObjectId: string
  sessionKey: SessionKey
  suiClient: SuiClient
  packageId: string
}): Promise<DecryptedMailContent> {
  const { mailBlobId, mailObjectId, sessionKey, suiClient, packageId } = params

  try {
    const sealClient = new SealClient({
      suiClient,
      serverConfigs: SERVER_OBJECT_IDS.map(id => ({ objectId: id, weight: 1 })),
      verifyKeyServers: false,
    })

    const encryptedBytes = await downloadBlobFromAggregator(mailBlobId)
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
    } catch (error) {
      if (error instanceof NoAccessError) {
        throw new Error(
          'Access denied: You are not authorized to read this email'
        )
      }
      throw error
    }

    const decryptedBytes = await sealClient.decrypt({
      data: encryptedBytes,
      sessionKey,
      txBytes,
    })

    const mailContent = JSON.parse(
      new TextDecoder('utf-8').decode(decryptedBytes)
    )

    return {
      subject: mailContent.subject,
      message: mailContent.message,
      timestamp: mailContent.timestamp,
    }
  } catch (error) {
    console.error('❌ Decryption failed:', error)
    throw error
  }
}
