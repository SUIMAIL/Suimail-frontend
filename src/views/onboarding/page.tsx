import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCurrentWallet, useCurrentAccount } from '@mysten/dapp-kit'
import { isValidSuiAddress } from '@mysten/sui/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FormSection } from './components/FormSection'
import { useToastContext } from '@/components/ui/toast'
import { ConfirmSuimailNSModal } from './components/ConfirmSuimailNSModal'
import { useSetUserSuimailNsMutation } from '@/hooks/onboarding'
import { MailBoardPageLayout } from '@/components/layouts'
import mixpanel from '@/utils/mixpanel'
import { AxiosError } from 'axios'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [suimailNs, setSuimailNs] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const { setNotification } = useToastContext()
  const { connectionStatus } = useCurrentWallet()
  const currentAccount = useCurrentAccount()

  const { mutateAsync: setUserSuimailNs, isPending: isSettingUpSuimailNs } =
    useSetUserSuimailNsMutation()

  useEffect(() => {
    if (connectionStatus === 'connected' && currentAccount?.address) {
      setWalletAddress(currentAccount.address)
    }
  }, [currentAccount, connectionStatus])

  const handleOnSendBeforeSubmit = async (_suimailNs: string) => {
    setShowConfirmDialog(true)
    setSuimailNs(_suimailNs)
  }

  const handleSubmit = async () => {
    if (!walletAddress || !isValidSuiAddress(walletAddress)) {
      setNotification({ message: 'Invalid wallet address', type: 'error' })
      return
    }

    setIsProcessing(true)
    setShowConfirmDialog(false)

    try {
      await setUserSuimailNs(suimailNs).then(() => {
        mixpanel.track('Onboarding Success', {
          suimail_ns: suimailNs,
        })
        queryClient.invalidateQueries({ queryKey: ['auth-me'] })
        setNotification({
          message: 'Onboarded Successfully 🎉',
          type: 'success',
        })
        // Navigate to inbox after successful onboarding
        navigate('/mail/inbox')
      })
    } catch (error) {
      console.error(error)
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          setNotification({
            message: 'SuiMail NS already exists',
            type: 'error',
          })
          mixpanel.track('Onboarding Failed', {
            suimail_ns: suimailNs,
            error_message: 'SuiMail NS already exists',
          })
        }
      } else {
        setNotification({
          message: 'Failed to Onboard',
          type: 'error',
        })
        mixpanel.track('Onboarding Failed', {
          suimail_ns: suimailNs,
          error_message: 'Failed to Onboard',
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <MailBoardPageLayout>
      <div className="min-h-screen flex flex-col items-center justify-center surface-base px-4 py-0 sm:py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="inline-flex items-center justify-center mb-4"
            >
              <div className="relative">
                <img
                  src="/images/suimail-logo.png"
                  alt="Suimail"
                  className="w-[150px] h-auto"
                />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold text-foreground mb-2"
            >
              Create Your Email Address
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              Your Decentralized Email on the Sui Blockchain
            </motion.p>
          </div>

          <FormSection
            handleSubmit={handleOnSendBeforeSubmit}
            isProcessing={isProcessing || isSettingUpSuimailNs}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-muted-foreground mt-6 space-y-2"
          >
            <p>
              By continuing, you agree to our{' '}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-blue-base transition-colors"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-blue-base transition-colors"
              >
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </motion.div>

        {/* Background blur effects */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute top-20 right-[20%] w-64 h-64 bg-blue-base/10 rounded-full blur-3xl -z-10"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-20 left-[20%] w-64 h-64 bg-blue-base/15 rounded-full blur-3xl -z-10"
        />
      </div>

      <ConfirmSuimailNSModal
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        suimailNs={suimailNs}
        handleOnConfirmSubmit={handleSubmit}
      />
    </MailBoardPageLayout>
  )
}
