import { useQuery } from '@tanstack/react-query'
import { httpService } from '../../api'
import type { IEmail } from '../../types/generic'

export function useFetchMailThread(mailId: string) {
  return useQuery({
    queryKey: ['mail-thread', mailId],
    queryFn: async (): Promise<IEmail[]> => {
      const { data } = await httpService.get(`/mail/${mailId}?thread=true`)
      return data.thread || data
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!mailId,
  })
}
