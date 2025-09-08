import mixpanel from '@/utils/mixpanel'
import { useConnectWallet } from '@mysten/dapp-kit'
import type { WalletWithRequiredFeatures } from '@mysten/wallet-standard'

interface ConnectWalletButtonProps {
  wallet: WalletWithRequiredFeatures
  disabled?: boolean
}

export function ConnectWalletButton({
  wallet,
  disabled = false,
}: ConnectWalletButtonProps) {
  const { mutateAsync: connect } = useConnectWallet()

  const handleConnect = () => {
    mixpanel.track('Wallet Connection Attempt', {
      wallet_name: wallet.name,
    })

    connect({ wallet })
      .then(() => {
        mixpanel.track('Wallet Connected', {
          wallet_name: wallet.name,
        })
      })
      .catch(() => {
        mixpanel.track('Wallet Connection Failed', {
          error_message: 'Wallet connection failed',
        })
      })
  }

  return (
    <button disabled={disabled} onClick={handleConnect}>
      Connect {wallet.name}
    </button>
  )
}
