import { httpService } from '@/api'
import {
  useMutation,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export const useCheckSuimailNsAvailabilityQuery = (
  ns_name: string,
  address?: string,
  options?: Omit<
    UseQueryOptions<{ available: boolean; message: string }, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    ...(options ?? {}),
    queryKey: ['suimail-ns-availability', ns_name],
    queryFn: async ({ signal }) => {
      return await httpService.get(`/onboarding/check-address/`, {
        signal,
        params: { ns_name, address },
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
