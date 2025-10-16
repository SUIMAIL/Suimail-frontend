// import { useState } from 'react'

// interface Mail {
//   id: string
//   subject: string
//   senderId: { suimailNs: string; imageUrl?: string } | null
//   recipientId: { suimailNs: string; imageUrl?: string } | null
//   createdAt: Date
//   readAt?: Date
//   attachments?: Array<{ fileName: string; fileType: string; content: string }>
//   metadata?: any
// }

// interface SearchParams {
//   query: string
//   folder?: 'inbox' | 'outbox' | 'all'
//   starred?: boolean
//   hasAttachments?: boolean
//   isRead?: boolean
// }

// export const useSearchMails = () => {
//   const [isSearching, setIsSearching] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const searchMails = async (params: SearchParams): Promise<Mail[]> => {
//     setIsSearching(true)
//     setError(null)

//     try {
//       const searchParams = new URLSearchParams({
//         query: params.query,
//         ...(params.folder && { folder: params.folder }),
//         ...(params.starred !== undefined && {
//           starred: String(params.starred),
//         }),
//         ...(params.hasAttachments !== undefined && {
//           hasAttachments: String(params.hasAttachments),
//         }),
//         ...(params.isRead !== undefined && { isRead: String(params.isRead) }),
//       })

//       // Get auth token from wherever you store it
//       const token =
//         localStorage.getItem('token') || sessionStorage.getItem('token')

//       const response = await fetch(`/api/mail/search?${searchParams}`, {
//         method: 'GET',
//         headers: {
//           Authorization: token ? `Bearer ${token}` : '',
//           'Content-Type': 'application/json',
//         },
//       })

//       // Check content type
//       const contentType = response.headers.get('content-type')
//       if (!contentType || !contentType.includes('application/json')) {
//         const text = await response.text()
//         console.error('Non-JSON response:', text)
//         throw new Error(
//           'Server returned an invalid response. Please check your authentication.'
//         )
//       }

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.message || 'Search failed')
//       }

//       // Handle different response formats
//       return data.data?.mails || data.data || []
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Search failed'
//       setError(errorMessage)
//       console.error('Search error:', err)
//       return []
//     } finally {
//       setIsSearching(false)
//     }
//   }

//   return { searchMails, isSearching, error }
// }
