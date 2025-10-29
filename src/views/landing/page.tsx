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
    <div className="min-h-screen surface-base flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Logo Section */}
      <div className="flex items-center gap-2 mb-8 sm:mb-10 lg:mb-12">
        <img
          src="/images/Black.png"
          alt="SUIMAIL"
          className="w-[160px] sm:w-[150px] lg:w-[180px] h-auto block dark:hidden"
        />
        <img
          src="/images/White.png"
          alt="SUIMAIL"
          className="w-[160px] sm:w-[150px] lg:w-[180px] h-auto hidden dark:block"
        />
      </div>

      {/* Login Card with Elevation */}
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="surface-light elevation-2 rounded-xl p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:elevation-3">
          {/* Header */}
          <h1 className="text-xl sm:text-2xl font-semibold text-center text-foreground mb-6 sm:mb-8">
            Login to your account
          </h1>

          {/* Connect Button */}
          <ConnectModal
            trigger={
              <button
                disabled={!!currentAccount || isLoginPending}
                className={`
                  w-full touch-target rounded-lg
                  flex items-center justify-center gap-3
                  text-base sm:text-lg font-medium
                  transition-all duration-200
                  ${
                    currentAccount || isLoginPending
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-blue-base text-white hover:bg-blue-dark hover:shadow-hover active:scale-[0.98]'
                  }
                `}
              >
                {isLoginPending && <LoginCircle />}
                <span className="py-1">
                  {renderConnectButtonLabel(currentAccount, isLoginPending)}
                </span>
              </button>
            }
            open={isModalOpen}
            onOpenChange={() => setIsModalOpen(!isModalOpen)}
          />

          {/* Feature Highlight */}
          <div className="mt-6 sm:mt-8 ">
            <p className="text-xs sm:text-sm text-center text-muted-foreground leading-relaxed">
              Secure, end-to-end encrypted email powered by Sui blockchain
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 sm:mt-16 text-xs sm:text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} SuiMail. All rights reserved.
      </footer>
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
    <svg
      className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-current"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  )
}
