import { useMutation, useQuery } from '@tanstack/react-query'
import { httpService } from '../../api'
import type { IUser } from '@/types/generic'

interface ChallengeResponse {
  message: string
  nonce: string
}

interface LoginParams {
  address: string
  signature: string
  nonce: string
}

//get Challenge to sign
export function useGetChallengeMutation() {
  return useMutation({
    mutationFn: async (address: string): Promise<ChallengeResponse> => {
      return await httpService.get(`/auth/challenge/${address}`)
    },
  })
}

//use Challenge to login
export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({
      address,
      signature,
      nonce,
    }: LoginParams): Promise<{ access_token: string }> => {
      return await httpService.post('/auth/login', {
        address,
        signature,
        nonce,
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
