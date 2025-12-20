import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import {
  WalletProvider,
  SuiClientProvider,
  createNetworkConfig,
  useSuiClientContext,
} from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { isEnokiNetwork, registerEnokiWallets } from '@mysten/enoki'
import '@mysten/dapp-kit/dist/index.css'
import routes from './routes'
import { queryClient } from './query-client'
import { suimailClientConfig } from './utils/config/clientConfig'
import AppProvider from './utils/contexts/AppContext/AppContextProvider'
import { ToastProvider } from './components/ui/toast'
import { SessionKeyProvider } from './utils/contexts/AppContext/SessionKeyContext'

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
})
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <RegisterEnokiWallets />
          <WalletProvider
            autoConnect
            slushWallet={{
              name: 'Suimail',
            }}
          >
            <ToastProvider>
              <SessionKeyProvider packageId={PACKAGE_ID}>
                <RouterProvider router={routes} />
              </SessionKeyProvider>
            </ToastProvider>
          </WalletProvider>
        </SuiClientProvider>
      </AppProvider>
    </QueryClientProvider>
  )
}

function RegisterEnokiWallets() {
  const { client, network } = useSuiClientContext()

  useEffect(() => {
    if (!isEnokiNetwork(network)) return

    const { unregister } = registerEnokiWallets({
      apiKey: suimailClientConfig.ENOKI_API_KEY,
      providers: {
        google: {
          clientId: suimailClientConfig.GOOGLE_CLIENT_ID,
        },
      },
      client,
      network,
    })

    return unregister
  }, [client, network])

  return null
}
