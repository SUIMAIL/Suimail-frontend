/* eslint-disable @typescript-eslint/no-explicit-any */
import { MIST_PER_SUI } from '@/constants'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'

export const useCreateEscrowTx = () => {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  const createEscrowTx = async (
    requiredFee: number,
    recipient: string
  ): Promise<string> => {
    const SUI_AMOUNT = requiredFee * MIST_PER_SUI

    try {
      const tx = new Transaction()

      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(SUI_AMOUNT)])

      tx.moveCall({
        target:
          '0x285fb6adc9f70f7b014557948b59c6f790a8876540a793df7cbb00778e2ddbba::escrow::create_escrow',
        arguments: [
          tx.object(coin), // SUI coin object
          tx.pure.address(recipient), // recipient address
          tx.pure.u64(100000), // duration in ms
          tx.object('0x6'), // clock object
        ],
      })

      // Sign and execute the transaction block
      const result = await new Promise<string>((resolve, reject) => {
        signAndExecuteTransaction(
          { transaction: tx, chain: 'sui:testnet' },
          {
            onSuccess: (response: any) => {
              resolve(response.digest)
            },
            onError: () => {
              reject('false')
            },
          }
        )
      })

      return result
    } catch {
      return 'false'
    }
  }

  return { createEscrowTx }
}
