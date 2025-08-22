export const MAX_ATTACHMENTS_TOTAL_SIZE = 1024 * 1024 * 10 // 10MB
export const MAX_ATTACHMENT_SIZE = 1024 * 293 // 293kb

/**
 * Check if the attachment is valid
 * @param file - The attachment to check
 * @returns true if the attachment is valid, false otherwise
 */
export const checkValidAttachmentSize = (files: File[]) => {
  return files.some(file => file.size > MAX_ATTACHMENT_SIZE)
}

/**
 * Check if the total attachments size is valid
 * @param attachments - The attachments to check
 * @returns true if the attachments are valid, false otherwise
 */
export const checkValidTotalAttachmentsSize = (attachments: File[]) => {
  const totalSize = attachments.reduce((acc, file) => acc + file.size, 0)
  return totalSize <= MAX_ATTACHMENTS_TOTAL_SIZE
}

/**
 * Calculate the total size of the attachments
 * @param attachments - The attachments to calculate the total size of (in bytes)
 * @returns The total size of the attachments
 */
export const calculateTotalAttachmentsSize = (attachments: File[]): number => {
  return attachments.reduce((acc, file) => acc + file.size, 0)
}
