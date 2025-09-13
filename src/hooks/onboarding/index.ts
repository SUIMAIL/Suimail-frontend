import { httpService } from '@/api'
import {
  useMutation,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export const useCheckSuimailNsAvailabilityQuery = (
  address: string,
  options?: Omit<
    UseQueryOptions<{ available: boolean; message: string }, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    ...(options ?? {}),
    queryKey: ['suimail-ns-availability', address],
    queryFn: async ({ signal }) => {
      return await httpService.get(`/onboarding/check-address/${address}`, {
        signal,
      })
    },
    gcTime: 0,
  })
}

export const useSetUserSuimailNsMutation = () => {
  return useMutation({
    mutationFn: async (suimailNs: string) => {
      return await httpService.post('/onboarding/suimailns', { suimailNs })
    },
  })
}
