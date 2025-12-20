import { MIST_PER_SUI } from '@/constants'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'

export const useChargeMailTxFee = () => {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  const chargeMailTxFee = async (
    requiredFee: number,
    recipient: string
  ): Promise<boolean> => {
    const SUI_AMOUNT = requiredFee * MIST_PER_SUI

    try {
      const tx = new Transaction()

      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(SUI_AMOUNT)])

      tx.transferObjects([coin], tx.pure.address(recipient))

      // Sign and execute the transaction block
      const result = await new Promise<boolean>((resolve, reject) => {
        signAndExecuteTransaction(
          { transaction: tx, chain: 'sui:testnet' },
          {
            onSuccess: () => {
              resolve(true)
            },
            onError: () => {
              reject(false)
            },
          }
        )
      })
      return result
    } catch {
      return false
    }
  }

  return { chargeMailTxFee }
}
