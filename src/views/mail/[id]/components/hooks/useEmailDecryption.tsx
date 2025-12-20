// import { useState, useEffect } from 'react'
// import { useToastContext } from '@/components/ui/toast'
// import { decryptMailContent } from '@/utils/decrypt-mail'
// import type { SuiClient } from '@mysten/sui/client'
// import type { IEmail } from '@/types/generic'

// interface DecryptedContent {
//   subject: string
//   message: string
//   timestamp: string
// }

// interface UseEmailDecryptionProps {
//   mail: IEmail | undefined
//   sessionKey: string | null
//   suiClient: SuiClient
//   packageId: string
// }

// export function useEmailDecryption({
//   mail,
//   sessionKey,
//   suiClient,
//   packageId,
// }: UseEmailDecryptionProps) {
//   const [decryptedContent, setDecryptedContent] =
//     useState<DecryptedContent | null>(null)
//   const [isDecrypting, setIsDecrypting] = useState(false)
//   const [decryptionError, setDecryptionError] = useState<string | null>(null)
//   const { setNotification } = useToastContext()

//   useEffect(() => {
//     async function decrypt() {
//       if (!mail?.mailBlobId || !mail?.mailObjectId) {

//         return
//       }

//       if (!sessionKey) {
//         return
//       }

//       if (decryptedContent) {
//         return
//       }

//       if (isDecrypting) {
//         console.log('⏳ Already decrypting, skipping')
//         return
//       }

//       setIsDecrypting(true)
//       setDecryptionError(null)

//       try {

//         const decrypted = await decryptMailContent({
//           mailBlobId: mail.mailBlobId,
//           mailObjectId: mail.mailObjectId,
//           sessionKey,
//           suiClient,
//           packageId,
//         })

//         console.log('✅ Email decrypted successfully!')
//         setDecryptedContent(decrypted)

//         setNotification({
//           message: 'Email decrypted successfully',
//           type: 'success',
//         })
//       } catch (error) {
//         console.error('❌ Failed to decrypt email:', error)
//         const errorMessage =
//           error instanceof Error ? error.message : 'Failed to decrypt email'

//         setDecryptionError(errorMessage)
//         setNotification({
//           message: errorMessage,
//           type: 'error',
//         })
//       } finally {
//         setIsDecrypting(false)
//       }
//     }

//     decrypt()
//   }, [
//     mail?.mailBlobId,
//     mail?.mailObjectId,
//     sessionKey,
//     decryptedContent,
//     isDecrypting,
//   ])

//   const resetDecryption = () => {
//     setDecryptionError(null)
//     setDecryptedContent(null)
//   }

//   return {
//     decryptedContent,
//     isDecrypting,
//     decryptionError,
//     resetDecryption,
//   }
// }
