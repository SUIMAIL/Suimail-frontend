import { suimailClientConfig } from '@/utils/config/clientConfig'
import { ACTIVE_RPC_NETWORK, suimailSuiClient } from '@/utils/config/suiClient'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { Transaction } from '@mysten/sui/transactions'
import { SuinsClient, SuinsTransaction } from '@mysten/suins'

const suinsClient = new SuinsClient({
  client: suimailSuiClient,
  network: ACTIVE_RPC_NETWORK,
})

const keypair = Ed25519Keypair.fromSecretKey(
  suimailClientConfig.SUIMAIL_PRIVATE_KEY
)

export const createUserSuins = async (name: string, targetAddress: string) => {
  const transaction = new Transaction()
  const suinsTransaction = new SuinsTransaction(suinsClient, transaction)

  suinsTransaction.createLeafSubName({
    parentNft: suimailClientConfig.PARENT_NFT_ID,
    name,
    targetAddress,
  })

  await suimailSuiClient.signAndExecuteTransaction({
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
