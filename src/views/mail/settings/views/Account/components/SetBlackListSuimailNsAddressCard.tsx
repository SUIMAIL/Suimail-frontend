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
    <div className="surface-light elevation-2 rounded-lg p-5 sm:p-6 border border-border">
      <div className="flex flex-col gap-4 sm:gap-5">
        <div>
          <h3 className="font-semibold text-base sm:text-lg mb-2 text-foreground">
            Black List Address
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
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
            className="surface-base border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={handleSetUserBlackList}
            disabled={
              blackList.length >= 20 ||
              isSetUserBlackListPending ||
              isRemoveFromBlackListPending
            }
            className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-target transition-all hover:shadow-hover whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>

        <div className="mt-2 sm:mt-4 space-y-2">
          {blackList.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No addresses in black list
            </div>
          ) : (
            blackList.map((suimailNs, index) => (
              <div
                key={index}
                className="flex items-center justify-between surface-dark elevation-1 p-3 rounded-md hover:elevation-2 transition-all border border-border/50"
              >
                <span className="text-sm text-foreground truncate mr-2">
                  {suimailNs}
                </span>
                <Button
                  disabled={isRemoveFromBlackListPending}
                  onClick={() => handleRemoveFromBlackList(suimailNs)}
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
