const NUM_EPOCHS = 50

async function getDraftEncryptionKey(userAddress: string): Promise<CryptoKey> {
  // Use the wallet address to derive a consistent key
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userAddress.padEnd(32, '0')),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive an AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('suimail-drafts-v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Upload encrypted data to Walrus
 */
async function uploadToWalrus(
  data: Uint8Array,
  publisherUrl: string
): Promise<string> {
  const response = await fetch(
    `${publisherUrl}/v1/blobs?epochs=${NUM_EPOCHS}`,
    {
      method: 'PUT',
      body: data,
    }
  )

  if (!response.ok) {
    throw new Error(`Walrus upload failed with status ${response.status}`)
  }

  const result = await response.json()

  // Handle both response formats
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
 * Download blob from Walrus aggregator
 */
async function downloadFromWalrus(blobId: string): Promise<Uint8Array> {
  const url = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Failed to fetch blob, status ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    console.error('Failed to download blob from Walrus:', error)
    throw new Error('Failed to download draft from Walrus')
  }
}

/**
 * Encrypt draft content and upload to Walrus
 * Returns the Walrus blobId
 */
export async function encryptAndUploadDraft(params: {
  subject: string
  message: string
  draftId: string
  userAddress: string
  publisherUrl: string
}): Promise<string> {
  const { subject, message, draftId, userAddress, publisherUrl } = params

  // Validate userAddress
  if (!userAddress) {
    console.error('User address is required for encryption')
    throw new Error(
      'Wallet address is required to encrypt drafts. Please connect your wallet.'
    )
  }

  if (!publisherUrl) {
    throw new Error('Walrus publisher URL is required')
  }

  try {
    const draftContent = JSON.stringify({
      subject,
      message,
      timestamp: new Date().toISOString(),
      draftId,
    })

    const encoder = new TextEncoder()
    const dataBytes = encoder.encode(draftContent)

    // Get encryption key derived from user's wallet address
    const key = await getDraftEncryptionKey(userAddress)

    // Generate random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Encrypt using AES-GCM
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBytes
    )

    const encryptedBytes = new Uint8Array(encryptedBuffer)

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encryptedBytes.length)
    combined.set(iv, 0)
    combined.set(encryptedBytes, iv.length)

    // Upload to Walrus
    const blobId = await uploadToWalrus(combined, publisherUrl)

    return blobId
  } catch (error) {
    console.error('Draft encryption/upload error:', error)
    throw new Error('Failed to encrypt and upload draft content')
  }
}

/**
 * Download and decrypt draft content from Walrus
 */
export async function downloadAndDecryptDraft(params: {
  blobId: string
  userAddress: string
}): Promise<{
  subject: string
  message: string
  timestamp: string
  draftId?: string
}> {
  const { blobId, userAddress } = params

  if (!blobId || typeof blobId !== 'string') {
    return {
      subject: '(Invalid draft data)',
      message: '(No content available)',
      timestamp: new Date().toISOString(),
    }
  }

  if (!userAddress) {
    return {
      subject: '(No wallet connected)',
      message: '(Connect wallet to decrypt)',
      timestamp: new Date().toISOString(),
    }
  }

  try {
    // Download encrypted data from Walrus
    const combinedBytes = await downloadFromWalrus(blobId)

    // Extract IV and encrypted data
    const iv = combinedBytes.slice(0, 12)
    const encryptedBytes = combinedBytes.slice(12)

    // Get decryption key
    const key = await getDraftEncryptionKey(userAddress)

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedBytes
    )

    const decoder = new TextDecoder()
    const jsonString = decoder.decode(decryptedBuffer)
    const content = JSON.parse(jsonString)

    return {
      subject: content.subject || '',
      message: content.message || '',
      timestamp: content.timestamp || new Date().toISOString(),
      draftId: content.draftId,
    }
  } catch (error) {
    console.error('Draft decryption error:', error)
    return {
      subject: '(Unable to decrypt)',
      message:
        '(Failed to decrypt content - may have been encrypted with different wallet)',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Download and decrypt draft preview from Walrus
 */
export async function downloadAndDecryptDraftPreview(params: {
  blobId: string
  userAddress: string
}): Promise<{
  subject: string
  message: string
  timestamp: string
}> {
  try {
    return await downloadAndDecryptDraft({
      blobId: params.blobId,
      userAddress: params.userAddress,
    })
  } catch (error) {
    console.error('Draft preview decryption failed:', error)
    return {
      subject: '(Encrypted Draft)',
      message: '(Click to view)',
      timestamp: new Date().toISOString(),
    }
  }
}

// Keep the old functions for backward compatibility during migration
// These work with base64 encrypted content (old backend format)

/**
 * @deprecated Use encryptAndUploadDraft instead
 * Legacy function for backward compatibility with backend-stored drafts
 */
export async function encryptDraftContent(params: {
  subject: string
  message: string
  draftId: string
  userAddress: string
}): Promise<string> {
  const { subject, message, draftId, userAddress } = params

  if (!userAddress) {
    console.error('User address is required for encryption')
    throw new Error(
      'Wallet address is required to encrypt drafts. Please connect your wallet.'
    )
  }

  try {
    const draftContent = JSON.stringify({
      subject,
      message,
      timestamp: new Date().toISOString(),
      draftId,
    })

    const encoder = new TextEncoder()
    const dataBytes = encoder.encode(draftContent)
    const key = await getDraftEncryptionKey(userAddress)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBytes
    )

    const encryptedBytes = new Uint8Array(encryptedBuffer)
    const combined = new Uint8Array(iv.length + encryptedBytes.length)
    combined.set(iv, 0)
    combined.set(encryptedBytes, iv.length)

    const encryptedContent = btoa(String.fromCharCode(...Array.from(combined)))
    return encryptedContent
  } catch (error) {
    console.error('Draft encryption error:', error)
    throw new Error('Failed to encrypt draft content')
  }
}

/**
 * @deprecated Use downloadAndDecryptDraft instead
 * Legacy function for backward compatibility with backend-stored drafts
 */
export async function decryptDraftContent(params: {
  encryptedContent: string
  userAddress: string
}): Promise<{
  subject: string
  message: string
  timestamp: string
  draftId?: string
}> {
  const { encryptedContent, userAddress } = params

  if (!encryptedContent || typeof encryptedContent !== 'string') {
    return {
      subject: '(Invalid draft data)',
      message: '(No content available)',
      timestamp: new Date().toISOString(),
    }
  }

  if (!userAddress) {
    return {
      subject: '(No wallet connected)',
      message: '(Connect wallet to decrypt)',
      timestamp: new Date().toISOString(),
    }
  }

  try {
    const binaryString = atob(encryptedContent.trim())
    const combinedBytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      combinedBytes[i] = binaryString.charCodeAt(i)
    }

    const iv = combinedBytes.slice(0, 12)
    const encryptedBytes = combinedBytes.slice(12)
    const key = await getDraftEncryptionKey(userAddress)

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedBytes
    )

    const decoder = new TextDecoder()
    const jsonString = decoder.decode(decryptedBuffer)
    const content = JSON.parse(jsonString)

    return {
      subject: content.subject || '',
      message: content.message || '',
      timestamp: content.timestamp || new Date().toISOString(),
      draftId: content.draftId,
    }
  } catch (error) {
    {
      console.error('Draft decryption error:', error)
    }
    return {
      subject: '(Unable to decrypt)',
      message:
        '(Failed to decrypt content - may have been encrypted with different wallet)',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * @deprecated Use downloadAndDecryptDraftPreview instead
 */
export async function decryptDraftPreview(params: {
  encryptedContent: string
  userAddress: string
}): Promise<{
  subject: string
  message: string
  timestamp: string
}> {
  try {
    return await decryptDraftContent({
      encryptedContent: params.encryptedContent,
      userAddress: params.userAddress,
    })
  } catch (error) {
    console.error('Draft preview decryption failed:', error)
    return {
      subject: '(Encrypted Draft)',
      message: '(Click to view)',
      timestamp: new Date().toISOString(),
    }
  }
}

export function getSubjectPreview(
  subject: string,
  length: number = 50
): string {
  if (!subject) return '(No subject)'
  return subject.length > length
    ? `${subject.substring(0, length)}...`
    : subject
}

export function getMessageSnippet(
  message: string,
  length: number = 100
): string {
  if (!message) return '(Empty message)'
  const cleanMessage = message.replace(/<[^>]*>/g, '').trim()
  return cleanMessage.length > length
    ? `${cleanMessage.substring(0, length)}...`
    : cleanMessage
}
