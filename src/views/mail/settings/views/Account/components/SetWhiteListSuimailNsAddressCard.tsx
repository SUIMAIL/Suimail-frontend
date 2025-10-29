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
    <div className="surface-light elevation-2 rounded-lg p-5 sm:p-6 border border-border">
      <div className="flex flex-col gap-4 sm:gap-5">
        <div>
          <h3 className="font-semibold text-base sm:text-lg mb-2 text-foreground">
            White List Address
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
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
            className="surface-base border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={handleSetUserWhiteList}
            disabled={
              whiteList.length >= 20 ||
              isSetUserWhiteListPending ||
              isRemoveUserWhiteListPending
            }
            className="px-4 py-2 bg-blue-base text-white hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-target transition-all hover:shadow-hover whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>

        <div className="mt-2 sm:mt-4 space-y-2">
          {whiteList.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No addresses in white list
            </div>
          ) : (
            whiteList.map((suimailNs, index) => (
              <div
                key={index}
                className="flex items-center justify-between surface-dark elevation-1 p-3 rounded-md hover:elevation-2 transition-all border border-border/50"
              >
                <span className="text-sm text-foreground truncate mr-2">
                  {suimailNs}
                </span>
                <Button
                  disabled={isRemoveUserWhiteListPending}
                  onClick={() => handleRemoveFromWhiteList(suimailNs)}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
