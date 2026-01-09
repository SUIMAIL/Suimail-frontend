import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useCurrentWallet,
  useCurrentAccount,
  useResolveSuiNSName,
} from '@mysten/dapp-kit'
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
  const [emailType, setEmailType] = useState<'standard' | 'verified'>(
    'standard'
  )
  const [selectedSuins, setSelectedSuins] = useState<string>('')

  const { setNotification } = useToastContext()
  const { connectionStatus } = useCurrentWallet()
  const currentAccount = useCurrentAccount()

  const { mutateAsync: setUserSuimailNs, isPending: isSettingUpSuimailNs } =
    useSetUserSuimailNsMutation()

  const {
    data: suinsName,
    isLoading: isLoadingSuins,
    error: suinsError,
  } = useResolveSuiNSName(
    walletAddress && isValidSuiAddress(walletAddress) ? walletAddress : null
  )

  useEffect(() => {
    if (connectionStatus === 'connected' && currentAccount?.address) {
      setWalletAddress(currentAccount.address)
    }
  }, [currentAccount, connectionStatus])

  useEffect(() => {
    if (!walletAddress) return

    if (suinsName) {
      setEmailType('verified')
      setSelectedSuins(suinsName.replace('.sui', ''))
    } else if (!isLoadingSuins && walletAddress && !suinsError) {
      if (emailType === 'verified') {
        setEmailType('standard')
      }
    }
  }, [suinsName, isLoadingSuins, walletAddress, suinsError])

  useEffect(() => {
    if (suinsError) {
      console.error('❌ Error resolving SuiNS:', suinsError)
      console.error('📊 Error details:', {
        message: suinsError?.message,
        name: suinsError?.name,
      })
    }
  }, [suinsError])

  const handleEmailTypeSwitch = (type: 'standard' | 'verified') => {
    setEmailType(type)
    if (type === 'verified' && suinsName) {
      setSelectedSuins(suinsName.replace('.sui', ''))
    } else if (type === 'standard') {
      setSelectedSuins('')
    }
  }

  const handleSuinsSelect = (name: string) => {
    setEmailType('verified')
    setSelectedSuins(name.replace('.sui', ''))
  }

  const handleOnSendBeforeSubmit = async (_suimailNs: string) => {
    setShowConfirmDialog(true)
    setSuimailNs(_suimailNs)
  }

  // const handleSubmit = async () => {
  //   // Format the namespace for the backend
  //   const formattedNamespace = suimailNs + '@suimailapp'
  //   if (!walletAddress || !isValidSuiAddress(walletAddress)) {
  //     console.error('❌ Invalid wallet address:', walletAddress)
  //     setNotification({ message: 'Invalid wallet address', type: 'error' })
  //     return
  //   }
  const handleSubmit = async () => {
    const formattedNamespace = suimailNs.includes('@suimailapp')
      ? suimailNs
      : suimailNs + '@suimailapp'
    if (!walletAddress || !isValidSuiAddress(walletAddress)) {
      console.error(' Invalid wallet address:', walletAddress)
      setNotification({ message: 'Invalid wallet address', type: 'error' })
      return
    }

    setIsProcessing(true)
    setShowConfirmDialog(false)

    try {
      await setUserSuimailNs(formattedNamespace).then(() => {
        mixpanel.track('Onboarding Success', {
          suimail_ns: suimailNs,
          email_type: emailType,
          has_suins: emailType === 'verified',
          full_email: `${suimailNs}@suimailapp`,
        })
        queryClient.invalidateQueries({ queryKey: ['auth-me'] })
        setNotification({
          message: 'Onboarded Successfully 🎉',
          type: 'success',
        })
        navigate('/mail/inbox')
      })
    } catch (error) {
      console.error('❌ Error during onboarding:', error)

      // Type-safe error handling
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      const axiosError = error instanceof AxiosError ? error : null

      console.error(' Error details:', {
        message: errorMessage,
        response: axiosError?.response,
        status: axiosError?.response?.status,
        data: axiosError?.response?.data,
      })

      if (axiosError) {
        if (axiosError.response?.status === 409) {
          console.error('⚠️ Conflict: SuiMail NS already exists')
          setNotification({
            message: 'SuiMail NS already exists',
            type: 'error',
          })
          mixpanel.track('Onboarding Failed', {
            suimail_ns: suimailNs,
            error_message: 'SuiMail NS already exists',
          })
        } else {
          console.error('⚠️ Axios error:', axiosError.response?.data)
          setNotification({
            message: axiosError.response?.data?.message || 'Failed to Onboard',
            type: 'error',
          })
          mixpanel.track('Onboarding Failed', {
            suimail_ns: suimailNs,
            error_message:
              axiosError.response?.data?.message || 'Failed to Onboard',
          })
        }
      } else {
        console.error('⚠️ Unknown error type')
        setNotification({
          message: errorMessage || 'Failed to Onboard',
          type: 'error',
        })
        mixpanel.track('Onboarding Failed', {
          suimail_ns: suimailNs,
          error_message: errorMessage || 'Failed to Onboard',
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
                  src="/images/Black.png"
                  alt="Suimail"
                  className="w-[160px] h-auto block dark:hidden"
                />
                <img
                  src="/images/White.png"
                  alt="Suimail"
                  className="w-[160px] h-auto hidden dark:block"
                />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold text-foreground mb-2"
            >
              Create Your SuiMail Address
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

          {/* SuiNS Detection Section */}
          <AnimatePresence mode="wait">
            {isLoadingSuins && walletAddress && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 surface-light elevation-1 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-base"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm text-muted-foreground">
                    Checking for SuiNS name...
                  </span>
                </div>
              </motion.div>
            )}

            {!isLoadingSuins && suinsError && walletAddress && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 surface-light elevation-1 rounded-lg p-4 border-l-4 border-amber-500"
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">
                      Couldn't check for SuiNS name
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Network issue or SuiNS not available
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      You can still create a standard email address
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {!isLoadingSuins && suinsName && emailType === 'verified' && (
              <motion.div
                key="suins-found"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="mb-6 surface-light elevation-2 rounded-xl p-5 border-2 border-blue-base/20"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-blue-base/10 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-blue-base"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      SuiNS Detected! 🎉
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We found your primary SuiNS name
                    </p>
                  </div>
                </div>

                {/* SuiNS Name Display */}
                <motion.div
                  onClick={() => handleSuinsSelect(suinsName)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 rounded-lg border-2 border-blue-base bg-blue-base/5 transition-all cursor-pointer mb-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {suinsName}
                      </span>
                      <svg
                        className="w-4 h-4 text-blue-base"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      @suimailapp
                    </span>
                  </div>
                </motion.div>

                <motion.button
                  onClick={() => handleEmailTypeSwitch('standard')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-sm text-blue-base hover:text-blue-dark transition-colors py-2 rounded-lg hover:bg-blue-base/5"
                >
                  Or create a standard address instead →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standard Email Form - Show when emailType is standard */}
          <AnimatePresence mode="wait">
            {emailType === 'standard' && (
              <motion.div
                key="standard-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="surface-light elevation-2 rounded-xl p-6 mb-4"
              >
                {suinsName && (
                  <motion.button
                    onClick={() => handleEmailTypeSwitch('verified')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-sm text-blue-base hover:text-blue-dark transition-colors mb-4 py-2 rounded-lg hover:bg-blue-base/5 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to your SuiNS name
                  </motion.button>
                )}

                <FormSection
                  handleSubmit={handleOnSendBeforeSubmit}
                  isProcessing={isProcessing || isSettingUpSuimailNs}
                />
              </motion.div>
            )}

            {/* Verified Email Display */}
            {emailType === 'verified' && selectedSuins && (
              <motion.div
                key="verified-display"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="surface-light elevation-2 rounded-xl p-6 mb-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Verified Suimail Address
                    </label>
                    <div className="flex items-center gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-mono text-foreground text-blue-500 font-medium break-all">
                        {selectedSuins}.sui@suimailapp
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      ✓ Verified SuiNS owner • Blue check badge included
                    </p>
                  </div>

                  <motion.button
                    onClick={() =>
                      handleOnSendBeforeSubmit(`${selectedSuins}.sui`)
                    }
                    disabled={isProcessing || isSettingUpSuimailNs}
                    whileHover={{
                      scale: isProcessing || isSettingUpSuimailNs ? 1 : 1.02,
                    }}
                    whileTap={{
                      scale: isProcessing || isSettingUpSuimailNs ? 1 : 0.98,
                    }}
                    className="w-full bg-blue-base hover:bg-blue-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing || isSettingUpSuimailNs ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Claim Verified Suimail'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
