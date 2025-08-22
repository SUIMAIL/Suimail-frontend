import { X } from 'lucide-react'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useRemoveFromWhiteListMutation,
  useSetUserWhiteListMutation,
} from '@/hooks/user'
import { Plus } from 'lucide-react'
import { useToastContext } from '@/components/ui/toast'
import { isValidSuimailAddress } from '@/utils/helpers'
import { AxiosError } from 'axios'
import { useQueryClient } from '@tanstack/react-query'

export function SetWhiteListSuimailNsAddressCard({
  whiteList,
}: {
  whiteList: string[]
}) {
  const queryClient = useQueryClient()

  const [whiteListInput, setWhiteListInput] = useState('')

  const { setNotification } = useToastContext()

  const {
    mutateAsync: setUserWhiteList,
    isPending: isSetUserWhiteListPending,
    error: setUserWhiteListError,
  } = useSetUserWhiteListMutation()

  const {
    mutateAsync: removeUserWhiteList,
    isPending: isRemoveUserWhiteListPending,
  } = useRemoveFromWhiteListMutation()

  const handleSetUserWhiteList = async () => {
    if (isValidSuimailAddress(whiteListInput)) {
      if (whiteList.includes(whiteListInput)) {
        setNotification({
          message: 'Address already in white list',
          type: 'error',
        })
        return
      }
      await setUserWhiteList(whiteListInput).then(async () => {
        setWhiteListInput('')
        setNotification({
          message: 'White List Address Added',
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

  const handleRemoveFromWhiteList = async (suimailNs: string) => {
    await removeUserWhiteList(suimailNs).then(async () => {
      setNotification({
        message: 'White List Address Removed',
        type: 'success',
      })
      await queryClient.invalidateQueries({
        queryKey: ['user-white-and-black-list-address'],
      })
    })
  }

  useEffect(() => {
    if (setUserWhiteListError) {
      if (setUserWhiteListError instanceof AxiosError) {
        const errorMessage = (
          setUserWhiteListError.response?.data as { message: string }
        ).message

        if (errorMessage === 'Cannot whitelist self') {
          setNotification({
            message: 'Cannot whitelist self',
            type: 'error',
          })
        } else if (errorMessage === 'Suimail namespace already in whitelist') {
          setNotification({
            message: 'Address already in white list',
            type: 'error',
          })
        } else {
          setNotification({
            message: 'Error setting white list address',
            type: 'error',
          })
        }
      }
    }
  }, [setNotification, setUserWhiteListError])

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-medium text-lg mb-2">White List Address</h3>
          <p className="text-sm text-gray-500">
            Add Suimail NS addresses to allow free mail delivery. Maximum 20
            addresses.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            value={whiteListInput}
            onChange={e => setWhiteListInput(e.target.value)}
            placeholder="Enter email address"
          />
          <Button
            onClick={handleSetUserWhiteList}
            disabled={
              whiteList.length >= 20 ||
              isSetUserWhiteListPending ||
              isRemoveUserWhiteListPending
            }
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {whiteList.map((suimailNs, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
            >
              <span className="text-sm">{suimailNs}</span>
              <Button
                disabled={isRemoveUserWhiteListPending}
                onClick={() => handleRemoveFromWhiteList(suimailNs)}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
