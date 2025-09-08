import type { LucideIcon } from 'lucide-react'
import type { IAttachmentType } from './attachment'

export interface IUser {
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
  body: string
  sender: Pick<IUser, 'suimailNs' | 'imageUrl'>
  recipient: Pick<IUser, 'suimailNs' | 'imageUrl'>
  readAt?: string
  createdAt: string
  digest?: string
  metadata?: {
    sender: {
      identifier: string
    }
    recipient: {
      identifier: string
    }
  }
  attachments?: IEmailAttachment[]
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
