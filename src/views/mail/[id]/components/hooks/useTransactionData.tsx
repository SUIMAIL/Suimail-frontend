import { useState, useEffect, useMemo } from 'react'
import { useSuiClientQuery } from '@mysten/dapp-kit'
import type { IEmail } from '@/types/generic'

export function useTransactionData(mail: IEmail | undefined, thread: IEmail[]) {
  const [txDigest, setTxDigest] = useState<string>('')
  const latestMail = thread.length > 0 ? thread[0] : mail

  const { data } = useSuiClientQuery('getTransactionBlock', {
    digest: txDigest,
    options: { showObjectChanges: true },
  })

  const firstCreatedObjectId = useMemo(
    () =>
      data?.objectChanges?.find(change => change.type === 'created')?.objectId,
    [data?.objectChanges]
  )

  useEffect(() => {
    if (latestMail?.digest) {
      setTxDigest(latestMail.digest)
    }
  }, [latestMail])

  return { txDigest, firstCreatedObjectId }
}
