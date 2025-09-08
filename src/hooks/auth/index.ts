import { useMutation, useQuery } from '@tanstack/react-query'
import { httpService } from '../../api'
import type { IUser } from '@/types/generic'

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (address: string): Promise<{ access_token: string }> => {
      return await httpService.get(`/auth/login/${address}`)
    },
  })
}

export const useGetAuthUserQuery = () => {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async (): Promise<IUser> => {
      return await httpService.get('/auth/me')
    },
  })
}
