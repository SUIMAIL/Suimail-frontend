import { useMutation, useQuery } from '@tanstack/react-query'
import { httpService } from '../../api'
import type { IEmail, IDraft } from '../../types/generic'

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

export function useFetchDraftsQuery() {
  return useQuery({
    queryKey: ['drafts-mails'],
    queryFn: async (): Promise<{ drafts: IDraft[] }> => {
      try {
        const response = await httpService.get('/mail/drafts')
        return response.data || response
      } catch (error) {
        console.error('Error fetching drafts:', error)
        return { drafts: [] }
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export function useFetchDraftQuery(draftId: string) {
  return useQuery({
    queryKey: ['draft-detail', draftId],
    queryFn: async (): Promise<{ draft: IDraft }> => {
      return await httpService.get(`/mail/drafts/${draftId}`)
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!draftId,
  })
}

interface IPostDraftMail {
  walletAddress: string
  recipient: string
  subject: string
  message: string
  attachments: File[]
}

interface SaveDraftPayload {
  recipientId?: string | null
  walrusBlobId: string
  draftId?: string
}

export function useSaveDraftMutation() {
  return useMutation({
    mutationFn: async (payload: SaveDraftPayload) => {
      if (!payload.walrusBlobId || payload.walrusBlobId.trim() === '') {
        throw new Error('Encrypted content is required')
      }

      const cleanPayload: any = {
        walrusBlobId: payload.walrusBlobId,
      }

      if (payload.recipientId && payload.recipientId.trim() !== '') {
        cleanPayload.recipientId = payload.recipientId
      }

      if (payload.draftId) {
        cleanPayload.draftId = payload.draftId
      }

      try {
        const response = await httpService.post('/mail/drafts', cleanPayload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        return response
      } catch (error: any) {
        console.error('Draft save error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          payload: cleanPayload,
        })
        console.error(
          'Draft save error - full details object:',
          JSON.stringify(error.response?.data?.details, null, 2)
        )

        if (error.response?.status === 500 && cleanPayload.draftId) {
          const fallbackPayload = { ...cleanPayload }
          delete fallbackPayload.draftId

          try {
            const response = await httpService.post(
              '/mail/drafts',
              fallbackPayload,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            )
            return response
          } catch (fallbackError) {
            console.error('Fallback draft save also failed:', fallbackError)
            throw fallbackError
          }
        }
        throw error
      }
    },
  })
}

/**
 * Delete a single draft
 */
export function useDeleteDraftMutation() {
  return useMutation({
    mutationFn: async (draftId: string) => {
      return await httpService.delete(`/mail/drafts/${draftId}`)
    },
  })
}

/**
 * Delete multiple drafts
 */
export function useDeleteManyDraftsMutation() {
  return useMutation({
    mutationFn: async (draftIds: string[]) => {
      return await httpService.delete('/mail/drafts/delete-many', {
        data: { draftIds },
      })
    },
  })
}

interface ConvertDraftPayload {
  draftId: string
  mailBlobId: string
  mailObjectId: string
  subject: string
  recipientId: string
  escrowDigest?: string
  attachments?: Array<{
    blobId: string
    fileName: string
    fileType: string
  }>
  parentMailId?: string
}

export function useConvertDraftToSentMutation() {
  return useMutation({
    mutationFn: async (payload: ConvertDraftPayload) => {
      const { draftId, ...data } = payload
      return await httpService.post(`/mail/drafts/${draftId}/convert`, data, {
        headers: {
          'Content-Type': 'application/json',
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
