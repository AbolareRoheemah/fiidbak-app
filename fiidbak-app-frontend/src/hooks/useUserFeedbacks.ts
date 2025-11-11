import { useAccount } from 'wagmi'
import { useAllFeedbacksByRange } from './useContract'

interface ContractFeedback {
  feedbackId: bigint | number
  feedbackBy: string
  productId: bigint | number
  positiveVotes: bigint | number
  negativeVotes: bigint | number
  totalVotes: bigint | number
  approved: boolean
  timestamp: bigint | number
  feedbackHash: string
}

export interface Feedback {
  id: number
  content: string
  author: string
  authorTier: number
  productId: number
  positiveVotes: number
  negativeVotes: number
  totalVotes: number
  approved: boolean
  createdAt: string
  hasUserVoted: boolean
  userVote: boolean | null
  ipfsHash: string
}

export function useUserFeedbacks() {
  const { address } = useAccount()

  // Fetch feedbacks from contract (getting first 100 to capture user's feedbacks)
  const {
    data: feedbackData,
    isLoading,
    error: fetchError,
    refetch
  } = useAllFeedbacksByRange(0, 100)

  // Parse and filter feedback data for current user
  const feedbacks: Feedback[] = Array.isArray(feedbackData) && address
    ? (feedbackData as ContractFeedback[])
        .filter((f) => f.feedbackBy?.toLowerCase() === address.toLowerCase())
        .map((f, index) => ({
          id: Number(f.feedbackId || index),
          content: f.feedbackHash || '',
          author: f.feedbackBy || '',
          authorTier: 1, // Will need to fetch from badge contract
          productId: Number(f.productId || 0),
          positiveVotes: Number(f.positiveVotes || 0),
          negativeVotes: Number(f.negativeVotes || 0),
          totalVotes: Number(f.totalVotes || 0),
          approved: f.approved || false,
          createdAt: f.timestamp ? new Date(Number(f.timestamp) * 1000).toISOString().substring(0, 10) : '',
          hasUserVoted: false,
          userVote: null,
          ipfsHash: f.feedbackHash || ''
        }))
    : []

  const error = fetchError ? 'Failed to fetch feedback' : null

  return {
    feedbacks,
    isLoading,
    error,
    refetch
  }
}
