import { useMutation, useQuery } from '@tanstack/react-query'
import { httpService } from '../../api'
import type { IEmail } from '../../types/generic'

export function useFetchMailBodyQuery(mailId: string) {
  return useQuery({
    queryKey: ['mail-body', mailId],
    queryFn: async (): Promise<any> => {
      return await httpService.get(`/mail/${mailId}`)
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}
export function useFetchInboxQuery() {
  return useQuery({
    queryKey: ['inbox-mails'],
    queryFn: async (): Promise<{ inbox: IEmail[] }> => {
      return await httpService.get('/mail/inbox/me')
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

// export const useFetchMailBlobIdQuery = (
//   mailId: string,
//   options?: { enabled?: boolean }
// ) => {
//   return useQuery({
//     queryKey: ['mail-blobId', mailId],
//     queryFn: async () => {
//       const response = await fetch(`/mail/blobId/${mailId}`)
//       if (!response.ok) {
//         throw new Error('Failed to fetch blob ID')
//       }
//       return response.json() // Returns { blobId: "..." }
//     },
//     enabled: options?.enabled ?? true,
//     staleTime: 1000 * 60 * 5, // Cache for 5 minutes
//   })
// }

export function useFetchOutboxQuery() {
  return useQuery({
    queryKey: ['outbox-mails'],
    queryFn: async (): Promise<{ outbox: IEmail[] }> => {
      return await httpService.get('/mail/outbox/me')
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

interface IPostDraftMail {
  walletAddress: string
  recipient: string
  subject: string
  message: string
  attachments: File[]
}

export function usePostDraftMailMutation() {
  return useMutation({
    mutationFn: async (mail: IPostDraftMail) => {
      const formData = new FormData()
      formData.append('from', mail.walletAddress)
      formData.append('to', mail.recipient)
      formData.append('subject', mail.subject)
      formData.append('message', mail.message)
      mail.attachments.forEach(file => formData.append('attachments', file))
      return await httpService.post('/mail/saveDraft', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
  })
}
interface Attachment {
  blobId: string
  fileName: string
  fileType: string
}

interface SendMailPayload {
  recipient: string
  subject: string
  mailBlobId: string
  mailObjectId: string
  attachments?: Attachment[]
  escrowDigest?: string
  parentMailId?: string
  isReply?: boolean
}

export function usePostSendMailMutation() {
  return useMutation({
    mutationFn: async (mailContent: SendMailPayload) => {
      return await httpService.post('/mail/send', mailContent, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },
  })
}

// export function usePostSendReplyMutation() {
//   return useMutation({
//     mutationFn: async (replyData: IPostReplyMail) => {
//       if (!replyData.to || !replyData.subject || !replyData.body) {
//         throw new Error('Missing required fields')
//       }

//       if (
//         !replyData.to ||
//         replyData.to.length < 1 ||
//         replyData.to.length > 100
//       ) {
//         throw new Error('Invalid recipient format')
//       }

//       const sanitizedTo = replyData.to.replace(/[<>;"']/g, '').trim()
//       if (sanitizedTo !== replyData.to.trim()) {
//         throw new Error('Invalid characters in recipient')
//       }

//       if (replyData.subject.length > 255) {
//         throw new Error('Subject is too long (maximum 255 characters)')
//       }

//       if (replyData.body.length > 50000) {
//         throw new Error('Message is too long (maximum 50,000 characters)')
//       }
//       const formData = new FormData()
//       formData.append('from', replyData.walletAddress || '')
//       formData.append('to', sanitizedTo)
//       formData.append('subject', replyData.subject.trim())
//       formData.append('message', replyData.body.trim())

//       if (replyData.inReplyTo) {
//         formData.append('inReplyTo', replyData.inReplyTo)
//       }
//       if (replyData.originalMessageId) {
//         formData.append('references', replyData.originalMessageId)
//       }

//       return await httpService.post('/mail/send', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       })
//     },
//   })
// }

export function usePostMarkMailsAsReadMutation() {
  return useMutation({
    mutationFn: async ({ mailIds }: { mailIds: string[] }) => {
      return await httpService.post('/mail/read-many', {
        mailIds,
      })
    },
  })
}

export function usePostDeleteMailsMutation() {
  return useMutation({
    mutationFn: async ({
      mailIds,
      path,
    }: {
      mailIds: string[]
      path: 'sender' | 'recipient'
    }) => {
      return await httpService.delete(`/mail/${path}/delete-many`, {
        data: {
          mailIds,
        },
      })
    },
  })
}

export function usePostDeleteMailMutation() {
  return useMutation({
    mutationFn: async ({
      mailId,
      path,
    }: {
      mailId: string
      path: 'sender' | 'recipient'
    }) => {
      return await httpService.delete(`/mail/${path}/delete/${mailId}`)
    },
  })
}
