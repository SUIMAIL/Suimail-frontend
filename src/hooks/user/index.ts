import { httpService } from '@/api'
import {
  useMutation,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export const useSetUserSuimailNsMutation = () => {
  return useMutation({
    mutationFn: async (suimailNs: string) => {
      return await httpService.post('/user/suimailns', { suimailNs })
    },
  })
}

export const useGetUserMailFeeAndAddressQuery = (
  recipient: string,
  options?: Omit<
    UseQueryOptions<{ mailFee: number; address: string }, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    ...(options ?? {}),
    queryKey: ['user-mail-fee-and-address', recipient],
    queryFn: async ({ signal }) => {
      const [mailFeeData, addressData] = await Promise.all([
        httpService.get(`/user/${recipient}/mailfee`, { signal }),
        httpService.get(`/user/${recipient}/address`, { signal }),
      ])

      return { mailFee: mailFeeData.mailFee, address: addressData.address }
    },
    gcTime: 0,
  })
}

export const useSetUserMailFeeMutation = () => {
  return useMutation({
    mutationFn: async (mailFee: number) => {
      return await httpService.post('/user/mailfee', { mailFee })
    },
  })
}

export const useSetUserWhiteListMutation = () => {
  return useMutation({
    mutationFn: async (suimailNs: string) => {
      return await httpService.post('/user/whitelist', { suimailNs })
    },
  })
}

export const useSetUserBlackListMutation = () => {
  return useMutation({
    mutationFn: async (suimailNs: string) => {
      return await httpService.post('/user/blacklist', { suimailNs })
    },
  })
}

export const useGetUserWhiteAndBlackListAddressQuery = () => {
  return useQuery({
    queryKey: ['user-white-and-black-list-address'],
    queryFn: async () => {
      const [whitelistData, blacklistData] = await Promise.all([
        httpService.get('/user/whitelist'),
        httpService.get('/user/blacklist'),
      ])

      return {
        whitelist: whitelistData.whitelist,
        blacklist: blacklistData.blacklist,
      }
    },
  })
}

export const useGetActiveUserMailFeeQuery = () => {
  return useQuery({
    queryKey: ['user-active-mail-fee'],
    queryFn: async (): Promise<{ mailFee: number }> => {
      return httpService.get(`/user/mailfee`)
    },
  })
}

export const useRemoveFromWhiteListMutation = () => {
  return useMutation({
    mutationFn: async (suimailNs: string) => {
      return await httpService.post(`/user/whitelist/remove`, { suimailNs })
    },
  })
}

export const useRemoveFromBlackListMutation = () => {
  return useMutation({
    mutationFn: async (suimailNs: string) => {
      return await httpService.post(`/user/blacklist/remove`, { suimailNs })
    },
  })
}

export const useGetActiveUserListStatusQuery = (
  suimailNs: string,
  options?: Omit<
    UseQueryOptions<
      {
        listedStatus: {
          senderIsWhitelisted: boolean
          senderIsBlacklisted: boolean
        }
      },
      AxiosError
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    ...(options ?? {}),
    queryKey: ['user-list-status', suimailNs],
    queryFn: async () => {
      return await httpService.get(`/user/listed-status/${suimailNs}`)
    },
    gcTime: 0,
  })
}

export const useSetUserProfileImageMutation = () => {
  return useMutation({
    mutationFn: async (imageUrl: string) => {
      return await httpService.post('/user/image-url', { imageUrl })
    },
  })
}

export const useGetUserProfileImageQuery = () => {
  return useQuery({
    queryKey: ['user-profile-image'],
    queryFn: async () => {
      return await httpService.get('/user/image-url')
    },
  })
}
