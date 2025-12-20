import { useState } from 'react'
import {
  Download,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { IAttachmentType } from '@/types/attachment'
import { decryptAttachment } from '../../../../utils/decrypt-attachment'
import { SessionKey } from '@mysten/seal'
import { SuiClient } from '@mysten/sui/client'

interface AttachmentBlobId {
  blobId: string
  fileName: string
  fileType: string
}

interface RenderAttachmentsProps {
  attachments: string[] | AttachmentBlobId[]
  mailObjectId: string
  sessionKey: SessionKey
  suiClient: SuiClient
  packageId: string
}

interface DecryptedAttachment {
  fileName: string
  fileType: IAttachmentType
  content: string // base64
  blobId: string
}

const RenderAttachments = ({
  attachments,
  mailObjectId,
  sessionKey,
  suiClient,
  packageId,
}: RenderAttachmentsProps) => {
  const [decryptedAttachments, setDecryptedAttachments] = useState<
    Map<string, DecryptedAttachment>
  >(new Map())
  const [loadingAttachments, setLoadingAttachments] = useState<Set<string>>(
    new Set()
  )
  const [errorAttachments, setErrorAttachments] = useState<Set<string>>(
    new Set()
  )

  const getAttachmentBlobId = (
    attachment: string | AttachmentBlobId
  ): string => {
    return typeof attachment === 'string' ? attachment : attachment.blobId
  }

  const getAttachmentMetadata = (
    attachment: string | AttachmentBlobId,
    index: number
  ) => {
    if (typeof attachment === 'string') {
      return {
        blobId: attachment,
        fileName: `attachment_${index + 1}`,
        fileType: 'application/octet-stream',
      }
    }
    return attachment
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return ImageIcon
    if (fileType.startsWith('video/')) return Video
    if (fileType === 'application/pdf') return FileText
    return File
  }

  const formatFileSize = (base64Content?: string): string => {
    if (!base64Content) return 'Unknown size'
    const bytes = (base64Content.length * 3) / 4
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleDecryptAttachment = async (
    blobId: string,
    fileName: string,
    fileType: string
  ) => {
    if (decryptedAttachments.has(blobId)) {
      return decryptedAttachments.get(blobId)!
    }

    if (loadingAttachments.has(blobId)) {
      return null
    }

    setLoadingAttachments(prev => new Set(prev).add(blobId))
    setErrorAttachments(prev => {
      const next = new Set(prev)
      next.delete(blobId)
      return next
    })

    try {
      const decrypted = await decryptAttachment({
        attachmentBlobId: blobId,
        mailObjectId,
        sessionKey,
        suiClient,
        packageId,
      })

      const attachment: DecryptedAttachment = {
        fileName,
        fileType: fileType as IAttachmentType,
        content: decrypted.content,
        blobId,
      }

      setDecryptedAttachments(prev => new Map(prev).set(blobId, attachment))
      return attachment
    } catch (error) {
      console.error('Failed to decrypt attachment:', error)
      setErrorAttachments(prev => new Set(prev).add(blobId))
      return null
    } finally {
      setLoadingAttachments(prev => {
        const next = new Set(prev)
        next.delete(blobId)
        return next
      })
    }
  }

  const handleDownload = async (
    blobId: string,
    fileName: string,
    fileType: string
  ) => {
    const attachment = await handleDecryptAttachment(blobId, fileName, fileType)
    if (!attachment) return

    const link = document.createElement('a')
    link.href = `data:${attachment.fileType};base64,${attachment.content}`
    link.download = attachment.fileName
    link.click()
  }

  // Safety check
  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment, index) => {
        const blobId = getAttachmentBlobId(attachment)
        const metadata = getAttachmentMetadata(attachment, index)
        const decrypted = decryptedAttachments.get(blobId)
        const isLoading = loadingAttachments.has(blobId)
        const hasError = errorAttachments.has(blobId)
        const FileIcon = getFileIcon(metadata.fileType)

        return (
          <div
            key={blobId}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-light hover:bg-accent/50 transition-colors group"
          >
            {/* Thumbnail/Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-accent/30 flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              ) : hasError ? (
                <AlertCircle className="h-6 w-6 text-red-500" />
              ) : decrypted && decrypted.fileType.startsWith('image/') ? (
                <img
                  src={`data:${decrypted.fileType};base64,${decrypted.content}`}
                  alt={decrypted.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {metadata.fileName}
              </p>
              <p className="text-xs text-muted-foreground">
                {decrypted ? formatFileSize(decrypted.content) : 'Encrypted'}
                {decrypted &&
                  ` • ${decrypted.fileType.split('/')[1]?.toUpperCase() || 'FILE'}`}
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() =>
                handleDownload(blobId, metadata.fileName, metadata.fileType)
              }
              disabled={isLoading}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={decrypted ? 'Download' : 'Decrypt & Download'}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : hasError ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Download className="h-5 w-5" />
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default RenderAttachments
