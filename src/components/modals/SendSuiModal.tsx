import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import type { Network } from '@mysten/suins'
import { ACTIVE_RPC_NETWORK } from '@/utils/config/suiClient'
import { isValidSuiAddress, MIST_PER_SUI } from '@mysten/sui/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/button'
import {
  AlertCircleIcon,
  ArrowUpRight,
  Check,
  Copy,
  Loader2,
  SendIcon,
  Wallet,
  X,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { useToastContext } from '../ui/toast'
import { useSendSuiTx } from '@/hooks/ptb/send-sui-tx'

const MIN_AMOUNT = 0.00000000001

export function SendSuiModal({
  currentAddress,
  walletBalance,
  onSuccess,
}: {
  currentAddress: string
  walletBalance: number
  onSuccess?: () => void
}) {
  const [modalOpen, setModalOpen] = useState(false)

  const walletBalanceInSui = useMemo(
    () => walletBalance / Number(MIST_PER_SUI),
    [walletBalance]
  )

  const [suiSentResponse, setSuiSentResponse] = useState<{
    transactionDigest: string
    amount: number
  } | null>(null)

  const formSchema = z.object({
    amount: z
      .number()
      .min(MIN_AMOUNT, {
        message: 'Invalid amount',
      })
      .max(walletBalanceInSui, {
        message: 'Invalid amount',
      }),
    recipient: z
      .string()
      .min(1)
      .refine(val => isValidSuiAddress(val) && val !== currentAddress, {
        message: 'Invalid Sui address or same as current address',
      }),
  })

  const {
    register,
    setValue,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      recipient: '',
    },
  })

  const { setNotification } = useToastContext()
  const { sendSuiTx, isLoading: isSending } = useSendSuiTx()

  useEffect(() => {
    if (errors.amount?.message) {
      setNotification({
        message: 'Error',
        description: errors.amount?.message,
        type: 'error',
      })
    }

    if (errors.recipient?.message) {
      setNotification({
        message: 'Error',
        description: errors.recipient?.message,
        type: 'error',
      })
    }
  }, [errors.amount?.message, errors.recipient?.message, setNotification])

  const quickSendAmounts = [25, 50, 100]

  const handleQuickSend = (amount: number) => {
    setValue('amount', walletBalanceInSui * (amount / 100), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await sendSuiTx(
        data.amount,
        data.recipient,
        response => {
          setSuiSentResponse({
            transactionDigest: response.digest,
            amount: data.amount,
          })
        },
        error => {
          setNotification({
            message: 'Error',
            description: error.message,
            type: 'error',
          })
        }
      )
    } catch {
      setNotification({
        message: 'Error',
        description: 'Failed to send SUI',
        type: 'error',
      })
    }
  }

  return (
    <AlertDialog
      open={modalOpen}
      onOpenChange={open => {
        if (!open) {
          setValue('amount', 0)
          setValue('recipient', '')
        }
        setModalOpen(open)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          size="lg"
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500 hover:shadow-blue-600 hover:shadow-md duration-300 transition-all hover:scale-105"
        >
          <SendIcon className="w-4 h-4" />
          <p className="text-white">Send</p>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Send SUI</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Send SUI to a wallet address
          </AlertDialogDescription>

          <AlertDialogCancel asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2.5 right-5 border-none rounded-full shadow-none"
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDialogCancel>
        </AlertDialogHeader>

        {suiSentResponse ? (
          <SuiSentSection
            transactionDigest={suiSentResponse.transactionDigest}
            onClose={() => {
              setValue('amount', 0)
              setValue('recipient', '')
              setSuiSentResponse(null)
              setModalOpen(false)

              // Refetch SUI balance
              onSuccess?.()
            }}
          />
        ) : (
          <>
            <Alert className="bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTitle className="flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-amber-800" />
                <p className="text-sm">
                  You are about to send SUI to a wallet address.
                </p>
              </AlertTitle>
            </Alert>

            <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Amount</Label>

                    <div className="flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-gray-500" />
                      <p className="text-xs text-gray-500">
                        {walletBalanceInSui.toFixed(8)} SUI
                      </p>
                    </div>
                  </div>
                  <Input
                    type="number"
                    step="any"
                    max={walletBalanceInSui}
                    min={MIN_AMOUNT}
                    placeholder="Enter amount"
                    {...register('amount', {
                      onChange: e => {
                        const value = e.target.value
                        if (value === '') {
                          setValue('amount', 0, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          })
                        } else {
                          setValue('amount', Number(value), {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          })
                        }
                      },
                    })}
                  />

                  <div className="flex items-center gap-2">
                    {quickSendAmounts.map(amount => (
                      <Button
                        type="button"
                        key={amount.toString()}
                        variant="outline"
                        size="sm"
                        className="bg-black text-white hover:scale-105 hover:bg-black hover:text-white duration-200 transition-all"
                        onClick={() => handleQuickSend(amount)}
                      >
                        {amount === 25 ? '25%' : amount === 50 ? '50%' : 'Max'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Recipient</Label>
                  <Input
                    type="text"
                    placeholder="Enter recipient"
                    {...register('recipient')}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full hover:bg-blue-600"
                  disabled={!isValid || isSending}
                >
                  {isSending && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Send
                </Button>
              </div>
            </form>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

const SuiSentSection = ({
  transactionDigest,
  onClose,
}: {
  transactionDigest: string
  onClose: () => void
}) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(transactionDigest)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const ACTIVE_NETWORK_EXPLORER_URL_MAP: Record<Network, string> = useMemo(
    () => ({
      testnet: 'https://testnet.suivision.xyz/txblock/',
      mainnet: 'https://suiscan.xyz/tx/',
      custom: 'https://suiscan.xyz/tx/',
    }),
    []
  )

  const explorerUrl = useMemo(
    () =>
      `${ACTIVE_NETWORK_EXPLORER_URL_MAP[ACTIVE_RPC_NETWORK]}${transactionDigest}`,
    [ACTIVE_NETWORK_EXPLORER_URL_MAP, transactionDigest]
  )

  const handleViewOnExplorer = () => {
    window.open(explorerUrl, '_blank')
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <Alert variant="success" className="">
        <AlertTitle className="flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4" />
          <p className="text-sm">Transaction Successful</p>
        </AlertTitle>

        <AlertDescription className="text-sm">
          Your SUI has been sent successfully.
        </AlertDescription>
      </Alert>

      <div className="mt-2 flex flex-col px-2 w-full">
        <p className="text-sm text-gray-500">Transaction Digest</p>

        <div className="w-full flex items-center justify-between gap-2">
          <p className="text-base truncate flex-1  max-w-[250px] sm:max-w-[300px] lg:max-w-[350px] p-2">
            {transactionDigest}
          </p>

          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            disabled={isCopied}
          >
            {isCopied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <Button
          variant="default"
          className="hover:bg-blue-600"
          onClick={handleViewOnExplorer}
        >
          View on Explorer <ArrowUpRight className="w-4 h-4" />
        </Button>

        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
