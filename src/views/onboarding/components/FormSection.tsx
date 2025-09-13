import type React from 'react'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Copy, Mail, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { isValidSuimailAddress } from '@/utils/helpers'
import { useToastContext } from '@/components/ui/toast'
import { useCheckSuimailNsAvailabilityQuery } from '@/hooks/onboarding'

interface FormSectionProps {
  handleSubmit: (suimailNs: string) => void
  isProcessing: boolean
}

const sampleAddresses = [
  'aliceweb3@suimailapp',
  'blockchain.dev@suimailapp',
  'crypto.trader@suimailapp',
]

type Availability = '' | 'checking' | 'available' | 'taken' | 'invalid'

export function FormSection({ handleSubmit, isProcessing }: FormSectionProps) {
  const [address, setAddress] = useState('')

  const { data: availabilityData, isLoading: isCheckingAvailability } =
    useCheckSuimailNsAvailabilityQuery(address, {
      enabled: isValidSuimailAddress(address),
    })

  const availability: Availability = useMemo(() => {
    if (isCheckingAvailability) {
      return 'checking'
    }
    if (availabilityData?.available) {
      return 'available'
    }
    return isValidSuimailAddress(address) ? 'taken' : ''
  }, [isCheckingAvailability, availabilityData, address])

  const handleAddressChange = (value: string) => {
    setAddress(value)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (availability === 'available') {
      handleSubmit(address)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-card rounded-lg border shadow-sm p-6"
      >
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">SuiMail NS</Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. aliceweb3@suimailapp"
                  value={address}
                  onChange={e => handleAddressChange(e.target.value)}
                  className="pr-10"
                  required
                />
                {address && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    type="button"
                    onClick={() => setAddress('')}
                    className="absolute right-3 top-[30%] -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
              {availability === 'checking' && (
                <p className="text-sm text-gray-500 mt-1">
                  Checking availability...
                </p>
              )}
              {availability === 'available' && (
                <p className="text-sm text-green-600 mt-1">
                  ✅ {address} is available
                </p>
              )}
              {availability === 'taken' && (
                <p className="text-sm text-red-600 mt-1">
                  ❌ {address} is already taken
                </p>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full"
            >
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isProcessing || availability !== 'available'}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'linear',
                    }}
                    className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : null}
                {isProcessing ? 'Processing...' : 'Register'}
              </Button>
            </motion.div>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or choose a sample name
              </span>
            </div>
          </div>

          <SampleAddressStack
            address={address}
            selectSampleAddress={setAddress}
          />
        </div>
      </motion.div>
    </>
  )
}

const SampleAddressStack = ({
  address,
  selectSampleAddress,
}: {
  address: string
  selectSampleAddress: (sampleAddress: string) => void
}) => {
  const { setNotification } = useToastContext()

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
    setNotification({
      message: 'Address copied to clipboard',
      type: 'success',
    })
  }

  return (
    <div className="mt-4 space-y-2">
      {sampleAddresses.map((sampleAddress, index) => (
        <motion.div
          key={sampleAddress}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + index * 0.1 }}
          whileHover={{
            scale: 1.01,
            backgroundColor: 'rgba(0,0,0,0.02)',
          }}
          className="flex items-center justify-between rounded-md border p-3 cursor-pointer"
          onClick={() => selectSampleAddress(sampleAddress)}
        >
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span
              className={cn(
                'text-sm',
                address === sampleAddress && 'font-medium text-primary'
              )}
            >
              {sampleAddress}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {address === sampleAddress && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-primary"
              >
                <CheckCircle2 className="h-4 w-4" />
              </motion.div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={e => {
                e.stopPropagation()
                copyToClipboard(sampleAddress)
              }}
              className="h-8 w-8"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
