import { useState } from 'react'
import { motion } from 'motion/react'
import { useQueryClient } from '@tanstack/react-query'
import { FormSection } from './components/FormSection'
import { useToastContext } from '@/components/ui/toast'
import { useSetUserSuimailNsMutation } from '@/hooks/user'
import { MailBoardPageLayout } from '@/components/layouts'
import { ConfirmSuimailNSModal } from './components/ConfirmSuimailNSModal'
import { AxiosError } from 'axios'
import { isValidSuimailAddress } from '@/utils/helpers'
import mixpanel from '@/utils/mixpanel'

export default function OnboardingPage() {
  const queryClient = useQueryClient()
  const [suimailNS, setSuimailNS] = useState('')

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { setNotification } = useToastContext()

  const { mutateAsync: setUserSuimailNs, isPending: isSettingUpSuimailNs } =
    useSetUserSuimailNsMutation()

  const copyToClipboard = (mailMessage: string) => {
    navigator.clipboard.writeText(mailMessage)
    setNotification({
      message: 'Mail copied to clipboard',
      type: 'success',
    })
  }

  const handleOnSendBeforeSubmit = async ({
    suimailNS,
  }: {
    suimailNS: string
  }) => {
    if (!isValidSuimailAddress(suimailNS)) {
      setNotification({
        message: 'Invalid SuiMail NS',
        description: 'Please enter a valid SuiMail NS',
        type: 'error',
      })
      return
    }

    setShowConfirmDialog(true)
    setSuimailNS(suimailNS)
  }

  const handleSubmit = async () => {
    const formattedSuimailNS = suimailNS.toLowerCase()

    if (!isValidSuimailAddress(formattedSuimailNS)) {
      setNotification({
        message: 'Invalid SuiMail NS',
        description: 'Please enter a valid SuiMail NS',
        type: 'error',
      })
      return
    }

    try {
      await setUserSuimailNs(formattedSuimailNS).then(async () => {
        mixpanel.track('Onboarding Success', {
          suimail_ns: formattedSuimailNS,
        })
        setNotification({
          message: 'Onboarded Successfully 🎉',
          type: 'success',
        })
        await queryClient.invalidateQueries({
          queryKey: ['auth-user'],
        })
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          setNotification({
            message: 'SuiMail NS already exists',
            type: 'error',
          })
          mixpanel.track('Onboarding Failed', {
            suimail_ns: formattedSuimailNS,
            error_message: 'SuiMail NS already exists',
          })
        }
      } else {
        setNotification({
          message: 'Failed to Onboard',
          type: 'error',
        })
        mixpanel.track('Onboarding Failed', {
          suimail_ns: formattedSuimailNS,
          error_message: 'Failed to Onboard',
        })
      }
    }
  }

  return (
    <MailBoardPageLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4 py-0 sm:py-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                delay: 0.2,
                type: 'spring',
                stiffness: 100,
              }}
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
            isSettingUpSuimailNs={isSettingUpSuimailNs}
            copyToClipboard={copyToClipboard}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-muted-foreground mt-4"
          >
            By continuing, you agree to our{' '}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute top-20 right-[20%] w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-20 left-[20%] w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"
        />
      </div>

      <ConfirmSuimailNSModal
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        suimailNS={suimailNS}
        handleOnConfirmSubmit={handleSubmit}
      />
    </MailBoardPageLayout>
  )
}
