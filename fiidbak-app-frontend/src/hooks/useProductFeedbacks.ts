import { useState, useEffect } from 'react'
import { useProductFeedbackIds } from './useContract'
import { readContract } from '@wagmi/core'
import { config } from '@/app/wagmi'
import { FEEDBACK_MANAGER_ABI } from '@/lib/feedback_mg_abi'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'
import { getUploadedFile } from '@/utils/pinata'

export interface ProductFeedback {
  id: number | bigint
  content: string
  author: string
  authorTier: number
  productId: number
  positiveVotes: number
  negativeVotes: number
  totalVotes: number
  approved: boolean
  createdAt?: string
  hasUserVoted: boolean
  userVote: null | boolean
}

export function useProductFeedbacks(productId?: number) {
  const [feedbacks, setFeedbacks] = useState<ProductFeedback[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Get feedback IDs for this product using the contract function
  const {
    data: feedbackIds,
    isLoading: isLoadingIds,
    refetch: refetchIds
  } = useProductFeedbackIds(productId)

  // Fetch all feedback details when IDs change
  useEffect(() => {
    let cancelled = false

    async function fetchFeedbacks() {
      if (!feedbackIds || !Array.isArray(feedbackIds) || feedbackIds.length === 0) {
        setFeedbacks([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const feedbackPromises = feedbackIds.map(async (feedbackId) => {
          try {
            // Fetch feedback data from contract
            const feedbackData = await readContract(config, {
              abi: FEEDBACK_MANAGER_ABI,
              address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
              functionName: 'getFeedback',
              args: [BigInt(feedbackId)]
            })

            if (!feedbackData) return null

            const d = feedbackData as any

            // Fetch content from IPFS if it's a hash
            let content = d.feedbackHash || ""
            let actualContent = content

            // Check if content is an IPFS hash
            if (content && typeof content === 'string' && (content.startsWith('Qm') || content.startsWith('bafy'))) {
              try {
                // Try using getUploadedFile first
                let ipfsUrl = null
                try {
                  ipfsUrl = await getUploadedFile(content)
                } catch (e) {
                  // Fallback to direct IPFS gateway URL
                  ipfsUrl = `https://ipfs.io/ipfs/${content}`
                }

                if (ipfsUrl) {
                  const res = await fetch(ipfsUrl)
                  if (res.ok) {
                    const ipfsData = await res.json()

                    // The IPFS data should have a 'content' field
                    if (ipfsData.content) {
                      actualContent = ipfsData.content
                    } else if (typeof ipfsData === 'string') {
                      actualContent = ipfsData
                    }
                  }
                }
              } catch (e) {
                console.error('Failed to fetch IPFS content for CID:', content, e)
              }
            }

            return {
              id: feedbackId,
              content: actualContent,
              author: d.feedbackBy || "",
              authorTier: 1,
              productId: Number(d.productId || 0),
              positiveVotes: Number(d.positiveVotes || 0),
              negativeVotes: Number(d.negativeVotes || 0),
              totalVotes: Number(d.totalVotes || 0),
              approved: d.approved || false,
              createdAt: d.timestamp ? new Date(Number(d.timestamp) * 1000).toISOString().substring(0, 10) : undefined,
              hasUserVoted: false,
              userVote: null,
            } as ProductFeedback
          } catch (err) {
            console.error('Error fetching feedback', feedbackId, err)
            return null
          }
        })

        const results = await Promise.all(feedbackPromises)
        const validFeedbacks = results.filter((f): f is ProductFeedback => f !== null)

        if (!cancelled) {
          setFeedbacks(validFeedbacks)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to fetch feedbacks')
          setIsLoading(false)
        }
        console.error('Error fetching feedbacks:', err)
      }
    }

    fetchFeedbacks()

    return () => {
      cancelled = true
    }
  }, [feedbackIds, refreshKey])

  const refetch = async () => {
    await refetchIds()
    setRefreshKey(prev => prev + 1)
  }

  return {
    feedbacks,
    isLoading: isLoading || isLoadingIds,
    error,
    refetch,
    feedbackCount: Array.isArray(feedbackIds) ? feedbackIds.length : 0
  }
}
