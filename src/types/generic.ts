import type { LucideIcon } from 'lucide-react'
import type { IAttachmentType } from './attachment'

export interface IUser {
  id: string
  address: string
  suimailNs?: string
  mailFee?: number
  whitelist?: string[]
  blacklist?: string[]
  imageUrl?: string
}

export interface IEmailAttachment {
  fileName: string
  fileType: IAttachmentType
  content: string
}

export interface IEmail {
  id: string
  subject: string
  mailBlobId: string
  mailObjectId: string
  starred: boolean
  createdAt: string
  readAt?: string
  escrowDigest?: string
  parentMailId?: string
  metadata?: Record<string, any> | null
  attachmentBlobIds?: string[]
  sender: Pick<IUser, 'suimailNs' | 'id' | 'imageUrl'>
  recipient: Pick<IUser, 'suimailNs' | 'id' | 'imageUrl'>
}

export interface IPlan {
  name: string
  description: string
  monthlyPrice: string
  yearlyPrice: string
  yearlyDiscount: string
  features: string[]
  highlighted: boolean
  ctaText: string
  icon: LucideIcon
  color: string
}
