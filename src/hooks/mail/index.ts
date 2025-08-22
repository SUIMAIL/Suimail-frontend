import { useMutation, useQuery } from '@tanstack/react-query'
import { httpService } from '../../api'
import type { IEmail } from '../../types/generic'

export function useFetchInboxQuery() {
  return useQuery({
    queryKey: ['inbox-mails'],
    queryFn: async (): Promise<{ data: IEmail[] }> => {
      return await httpService.get('/mail/inbox/me')
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export function useFetchMailBodyQuery(mailId: string) {
  return useQuery({
    queryKey: ['mail-body', mailId],
    queryFn: async (): Promise<IEmail> => {
      return await httpService.get(`/mail/${mailId}`)
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export function useFetchOutboxQuery() {
  return useQuery({
    queryKey: ['outbox-mails'],
    queryFn: async (): Promise<{ data: IEmail[] }> => {
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

export function usePostSendMailMutation() {
  return useMutation({
    mutationFn: async (mailContent: FormData) => {
      return await httpService.post('/mail/send', mailContent, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
  })
}

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
