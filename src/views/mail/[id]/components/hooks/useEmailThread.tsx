import { useState, useEffect } from 'react'
import type { IEmail } from '@/types/generic'

export function useEmailThread(mail: IEmail | undefined) {
  const [thread, setThread] = useState<IEmail[]>([])

  useEffect(() => {
    async function buildThread(currentMail: IEmail | undefined) {
      if (!currentMail) {
        setThread([])
        return
      }

      const chain: IEmail[] = [currentMail]
      let parentId = currentMail.parentMailId

      while (parentId) {
        try {
          const parent = await fetchMail(parentId)
          if (!parent) break
          chain.push(parent)
          parentId = parent.parentMailId
        } catch {
          break
        }
      }

      setThread(chain)
    }

    buildThread(mail)
  }, [mail])

  return { thread }
}

async function fetchMail(mailId: string): Promise<IEmail | null> {
  try {
    const res = await fetch(`/mail/${mailId}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
