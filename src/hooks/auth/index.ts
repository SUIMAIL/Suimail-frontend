import { useMutation, useQuery } from '@tanstack/react-query'
import { httpService } from '../../api'
import type { IUser } from '@/types/generic'

interface LoginParams {
  address: string
  signature: string
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({
      address,
      signature,
    }: LoginParams): Promise<{ access_token: string }> => {
      // Use POST instead of GET - much better for signatures
      return await httpService.post('/auth/login', {
        address,
        signature,
      })
    },
  })
}

export const useGetAuthUserQuery = () => {
  return useQuery({
    queryKey: ['auth-me'],
    queryFn: async (): Promise<IUser> => {
      return await httpService.get('/auth/me')
    },
  })
}
