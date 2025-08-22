import { useMemo } from 'react'
import {
  useGetActiveUserMailFeeQuery,
  useSetUserMailFeeMutation,
} from '@/hooks/user'
import { useToastContext } from '@/components/ui/toast'
import { SetMailFeeCard } from './components/SetMailFeeCard'
import { PageLayout } from '@/components/layouts'
import { SubviewHeader } from '../../components/subview-header'
import { SetWhiteAndBlackListAddress } from './components/SetWhiteAndBlackListAddress'
import { useQueryClient } from '@tanstack/react-query'

export function AccountView() {
  const queryClient = useQueryClient()
  const { setNotification } = useToastContext()
  const { mutateAsync: setUserMailFee, isPending } = useSetUserMailFeeMutation()

  const {
    data: activeUserMailFeeData,
    isFetching,
    isError,
  } = useGetActiveUserMailFeeQuery()

  const handleSetMailFee = async (mailFee: number) => {
    try {
      await setUserMailFee(mailFee).then(async () => {
        setNotification({
          message: `Successfully set mail fee to ${mailFee} SUI`,
          type: 'success',
        })
        await queryClient.invalidateQueries({
          queryKey: ['user-active-mail-fee'],
        })
      })
    } catch {
      setNotification({
        message: 'Failed to update mail fee. Please try again.',
        type: 'error',
      })
    }
  }

  const activeUserMailFee = useMemo(
    () => activeUserMailFeeData?.mailFee ?? 0,
    [activeUserMailFeeData]
  )

  return (
    <PageLayout loading={isFetching} isError={isError}>
      <SubviewHeader
        title="Account Settings"
        description="Manage your personal info, wallet, and linked accounts."
      />

      <div className="flex flex-col gap-10">
        <SetMailFeeCard
          userMailFee={activeUserMailFee}
          handleSetMailFee={handleSetMailFee}
          isPending={isPending}
        />

        <SetWhiteAndBlackListAddress />
      </div>
    </PageLayout>
  )
}
