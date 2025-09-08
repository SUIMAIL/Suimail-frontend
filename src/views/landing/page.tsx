import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WalletAccount } from '@wallet-standard/base'
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit'
import { setCookie } from '@/utils/helpers/auth'
import { useLoginMutation } from '../../hooks/auth'
import { ACCESS_TOKEN_COOKIE_NAME } from '@/constants'
import mixpanel from '@/utils/mixpanel'

export default function LandingPage() {
  const navigate = useNavigate()
  const currentAccount = useCurrentAccount()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAccountIsSet, setCurrentAccountIsSet] = useState(false)
  const { mutateAsync: login, isPending: isLoginPending } = useLoginMutation()

  const handleLogin = useCallback(
    async (wallet: WalletAccount) => {
      try {
        const response = await login(wallet.address)
        if (response.access_token) {
          mixpanel.track('Login Success', {
            wallet_address: wallet.address,
          })
          setCookie(ACCESS_TOKEN_COOKIE_NAME, response.access_token)
          navigate('/mail/inbox')
        }
      } catch {
        mixpanel.track('Login Failed', {
          wallet_address: wallet.address,
          error_message: 'Login failed',
        })
      }
    },
    [login, navigate]
  )

  useEffect(() => {
    if (currentAccount && !currentAccountIsSet) {
      handleLogin(currentAccount)
      setCurrentAccountIsSet(true)
    }
  }, [currentAccount, handleLogin, currentAccountIsSet])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-8">
        <img
          src="/images/suimail-logo.png"
          alt="SUIMAIL"
          className="w-[150px] h-auto"
        />
      </div>

      <div className="w-full max-w-sm p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
        <h1 className="text-xl font-medium text-center text-gray-800 mb-6">
          Login to your account
        </h1>

        <ConnectModal
          trigger={
            <button
              disabled={!!currentAccount || isLoginPending}
              className={`w-full py-3 px-4 rounded-md flex items-center justify-center gap-2 text-base font-medium ${
                currentAccount || isLoginPending
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isLoginPending && <LoginCircle />}
              {renderConnectButtonLabel(currentAccount, isLoginPending)}
            </button>
          }
          open={isModalOpen}
          onOpenChange={() => setIsModalOpen(!isModalOpen)}
        />

        <p className="mt-4 text-xs text-center text-gray-500">
          Secure, end-to-end encrypted email powered by Sui blockchain
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} SuiMail
      </p>
    </div>
  )
}

const renderConnectButtonLabel = (
  wallet: WalletAccount | null,
  isPending: boolean
) => {
  if (!wallet) return 'Connect Wallet'
  if (isPending) return 'Connecting...'
  return `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
}

const LoginCircle = () => {
  return (
    <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
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
  )
}
