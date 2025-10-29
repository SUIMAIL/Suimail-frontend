import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CheckIcon, CopyIcon, RefreshCcw } from 'lucide-react'
import { SendSuiModal } from '@/components/modals/SendSuiModal'
import { ReceiveSuiModal } from '@/components/modals/ReceiveSuiModal'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useSuiClientQuery } from '@mysten/dapp-kit'
import { MIST_PER_SUI } from '@/constants'
import { useGetSuiStats } from '@/hooks/custom'
import { cn } from '@/lib/utils'
import { getSuiUSDBalance } from '../utils/clean-amount'

interface HeroCardProps {
  accountAddress: string
}

export function HeroCard({ accountAddress }: HeroCardProps) {
  const {
    data: balance,
    refetch: refetchBalance,
    isRefetching,
  } = useSuiClientQuery(
    'getBalance',
    {
      owner: accountAddress,
    },
    {
      staleTime: 0,
      gcTime: 0,
    }
  )

  const { data: suiUSDPrice } = useGetSuiStats()

  const walletData = useMemo(() => {
    const suiPrice = suiUSDPrice?.stats.price ?? 0
    const balanceUsd = getSuiUSDBalance(
      suiPrice,
      Number(balance?.totalBalance ?? 0)
    )

    const balanceSui = Number(balance?.totalBalance ?? 0) / Number(MIST_PER_SUI)

    return {
      address: accountAddress,
      formattedBalanceSui: balanceSui.toFixed(8),
      formattedBalanceUsd: balanceUsd.toFixed(4),
    }
  }, [balance, accountAddress, suiUSDPrice])

  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(walletData.address)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <Card className="surface-light elevation-2 border-border">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-sm font-normal text-muted-foreground">
          Total Balance
        </CardTitle>
        <VisuallyHidden>
          <CardDescription>Total balance in your wallet</CardDescription>
        </VisuallyHidden>

        <div className="flex flex-col items-center">
          <div className="pl-3 flex items-center gap-2">
            <p className="text-3xl font-bold text-blue-base">
              {walletData.formattedBalanceSui} SUI
            </p>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => refetchBalance()}
              className="hover:bg-accent"
            >
              <RefreshCcw
                className={cn('w-3 h-3', {
                  'animate-spin': isRefetching,
                })}
              />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            ≈ ${walletData.formattedBalanceUsd} USD
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-7 pb-10">
        <div className="flex flex-col gap-2">
          <div className="w-full surface-dark elevation-1 rounded-md p-4 border border-border">
            <p className="text-xs text-muted-foreground">Wallet Address</p>
            <div className="mt-2 flex items-center gap-2">
              <Input
                readOnly
                value={accountAddress}
                className="focus-visible:ring-0 surface-base border-border text-foreground"
              />

              <Button
                size="icon"
                className="bg-blue-base hover:bg-blue-dark text-white touch-target"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 w-full flex items-center justify-center gap-3">
            <SendSuiModal
              currentAddress={accountAddress}
              walletBalance={Number(balance?.totalBalance ?? 0)}
              onSuccess={() => {
                refetchBalance()
              }}
            />
            <ReceiveSuiModal currentAddress={accountAddress} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
