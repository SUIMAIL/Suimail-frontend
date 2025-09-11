'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCurrentWallet } from '@mysten/dapp-kit'
import { SuinsClient, SuinsTransaction } from '@mysten/suins'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { isValidSuiAddress } from '@mysten/sui/utils'
import { useQueryClient } from '@tanstack/react-query'

import { FormSection } from './components/FormSection'
import { useToastContext } from '@/components/ui/toast'
import { ConfirmSuimailNSModal } from './components/ConfirmSuimailNSModal'
import { useAppContext } from '@/utils/contexts/AppContext/AppContext'
import { useSetUserSuimailNsMutation } from '@/hooks/user'
import { MailBoardPageLayout } from '@/components/layouts'

const rpcUrl = getFullnodeUrl('testnet')
const client = new SuiClient({ url: rpcUrl })

if (!import.meta.env.VITE_PRIVATE_KEY) {
  throw new Error('Missing VITE_PRIVATE_KEY in environment variables')
}

const keypair = Ed25519Keypair.fromSecretKey(import.meta.env.VITE_PRIVATE_KEY)
const suinsClient = new SuinsClient({ client, network: 'testnet' })
const PARENT_NFT_ID = import.meta.env.VITE_PARENT_NFT_ID || ''

const createLeafSubname = async (
  name: string,
  parentNftId: string,
  targetAddress: string
) => {
  const transaction = new Transaction()
  const suinsTransaction = new SuinsTransaction(suinsClient, transaction)

  suinsTransaction.createLeafSubName({
    parentNft: parentNftId,
    name,
    targetAddress,
  })

  await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: suinsTransaction.transaction,
    options: {
      showBalanceChanges: true,
      showEvents: true,
      showEffects: true,
      showObjectChanges: true,
    },
  })
}

export default function SubnameManagerPage() {
  const { setSubname } = useAppContext()
  const queryClient = useQueryClient()
  const [subname, setSubnameState] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const { setNotification } = useToastContext()
  const { currentWallet, connectionStatus } = useCurrentWallet()

  const { mutateAsync: setUserSuimailNs, isPending: isSettingUpSuimailNs } =
    useSetUserSuimailNsMutation()

  useEffect(() => {
    if (
      connectionStatus === 'connected' &&
      currentWallet?.accounts?.[0]?.address
    ) {
      setWalletAddress(currentWallet.accounts[0].address)
    }
  }, [currentWallet, connectionStatus])

  const copyToClipboard = (name: string) => {
    navigator.clipboard.writeText(name)
    setNotification({
      message: 'Name copied to clipboard',
      type: 'success',
    })
  }

  const handleOnSendBeforeSubmit = async ({ name }: { name: string }) => {
    if (!name) {
      setNotification({
        message: 'Please enter a subname',
        type: 'error',
      })
      return
    }

    setShowConfirmDialog(true)
    setSubnameState(name)
  }

  const handleSubmit = async () => {
    if (!walletAddress || !isValidSuiAddress(walletAddress)) {
      setNotification({ message: 'Invalid wallet address', type: 'error' })
      return
    }

    setIsProcessing(true)
    setShowConfirmDialog(false)

    try {
      console.log('→ Creating subname on Suins...')
      await createLeafSubname(subname, PARENT_NFT_ID, walletAddress)
      console.log('✅ Subname registered on Suins')

      console.log('→ Registering on backend...')
      await setUserSuimailNs({
        suimailNs: subname,
      })
      console.log('✅ Registered on backend')

      setSubname(subname)
      await queryClient.invalidateQueries({ queryKey: ['auth-user'] })
      setNotification({ message: 'Onboarded Successfully 🎉', type: 'success' })
    } catch (error) {
      console.error('Registration error:', error)
      setNotification({ message: 'Failed to Onboard', type: 'error' })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <MailBoardPageLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4 py-0 sm:py-4">
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
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              Register your Subname on SuiMail
            </motion.p>
          </div>

          <FormSection
            handleSubmit={handleOnSendBeforeSubmit}
            isProcessing={isProcessing || isSettingUpSuimailNs}
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
        subname={subname}
        handleOnConfirmSubmit={handleSubmit}
      />
    </MailBoardPageLayout>
  )
}
