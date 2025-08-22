import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToastContext } from '@/components/ui/toast'
import {
  useRemoveFromBlackListMutation,
  useSetUserBlackListMutation,
} from '@/hooks/user'
import { isValidSuimailAddress } from '@/utils/helpers'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export function SetBlackListSuimailNsAddressCard({
  blackList,
}: {
  blackList: string[]
}) {
  const queryClient = useQueryClient()

  const [blackListInput, setBlackListInput] = useState('')

  const { setNotification } = useToastContext()

  const {
    mutateAsync: setUserBlackList,
    isPending: isSetUserBlackListPending,
    error: setUserBlackListError,
  } = useSetUserBlackListMutation()

  const {
    mutateAsync: removeFromBlackList,
    isPending: isRemoveFromBlackListPending,
  } = useRemoveFromBlackListMutation()

  const handleSetUserBlackList = async () => {
    if (isValidSuimailAddress(blackListInput)) {
      if (blackList.includes(blackListInput)) {
        setNotification({
          message: 'Address already in black list',
          type: 'error',
        })
        return
      }
      await setUserBlackList(blackListInput).then(async () => {
        setBlackListInput('')
        setNotification({
          message: 'Black List Address Added',
          type: 'success',
        })
        await queryClient.invalidateQueries({
          queryKey: ['user-white-and-black-list-address'],
        })
      })
    } else {
      setNotification({
        message: 'Invalid Suimail Namespace',
        type: 'error',
      })
    }
  }

  const handleRemoveFromBlackList = async (suimailNs: string) => {
    await removeFromBlackList(suimailNs).then(async () => {
      setNotification({
        message: 'Black List Address Removed',
        type: 'success',
      })
      await queryClient.invalidateQueries({
        queryKey: ['user-white-and-black-list-address'],
      })
    })
  }

  useEffect(() => {
    if (setUserBlackListError) {
      if (setUserBlackListError instanceof AxiosError) {
        const errorMessage = (
          setUserBlackListError.response?.data as { message: string }
        ).message

        if (errorMessage === 'Cannot blacklist self') {
          setNotification({
            message: 'Cannot blacklist self',
            type: 'error',
          })
        } else if (errorMessage === 'Suimail namespace already in blacklist') {
          setNotification({
            message: 'Address already in black list',
            type: 'error',
          })
        } else {
          setNotification({
            message: 'Error setting black list address',
            type: 'error',
          })
        }
      }
    }
  }, [setNotification, setUserBlackListError])

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-medium text-lg mb-2">Black List Address</h3>
          <p className="text-sm text-gray-500">
            Block Suimail NS addresses to prevent mail delivery. Maximum 20
            addresses.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            value={blackListInput}
            onChange={e => setBlackListInput(e.target.value)}
            placeholder="Enter email address"
          />
          <Button
            onClick={handleSetUserBlackList}
            disabled={
              blackList.length >= 20 ||
              isSetUserBlackListPending ||
              isRemoveFromBlackListPending
            }
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {blackList.map((suimailNs, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
            >
              <span className="text-sm">{suimailNs}</span>
              <button
                onClick={() => handleRemoveFromBlackList(suimailNs)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
