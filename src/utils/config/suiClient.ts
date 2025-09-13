import { getFullnodeUrl, SuiClient } from '@mysten/sui/client'
import type { Network } from '@mysten/suins'

const ACTIVE_RPC_NETWORK: Network = 'testnet'

const suimailSuiClient = new SuiClient({
  url: getFullnodeUrl(ACTIVE_RPC_NETWORK),
})

export { suimailSuiClient, ACTIVE_RPC_NETWORK }
